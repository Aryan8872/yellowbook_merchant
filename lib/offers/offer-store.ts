import { create } from "zustand";
import { Offer } from "../types/offer";

interface SearchParams {
    q?: string;
    category?: string;
    /** Matches backend enum exactly */
    sortBy?: 'trending' | 'popular' | 'rating' | 'savings' | 'newest';
    sortOrder?: 'asc' | 'desc';
    city?: string;
    location?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    page: number;
    limit: number;
    merchantId?: string;
}

interface offerstorestate {
    offers: Offer[];
    isLoading: boolean;
    error: string | null;
    hasAttemptedFetch: boolean;
    getOffers: () => Promise<Offer[]>;
    clearError: () => void;
    searchParams: SearchParams;
    setSearchParams: (params: Partial<SearchParams>) => void
}

export const useOfferStore = create<offerstorestate>((set, get) => ({
    offers: [],
    searchParams: { page: 1, limit: 10 },
    error: null,
    hasAttemptedFetch: false,
    setSearchParams: (params) => set((state) => ({
        searchParams: {
            ...state.searchParams,
            ...(params.page == undefined && { page: 1 }),
            ...params

        }
    })),
    isLoading: false,
    clearError: () => set({ error: null }),
    getOffers: async () => {
        // Don't fetch if already in error state (unless explicitly cleared)
        const { error } = get();
        if (error) {
            return [];
        }
        
        set({ isLoading: true, error: null, hasAttemptedFetch: true })
        try {
            const { searchParams } = get();
            const query = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    query.set(key, String(value));
                }
            });
            const response = await fetch(`/api/offers?${query.toString()}`)
            console.log(response)
            if (response.ok) {
                const json = await response.json();
                console.log(json.data)
                set({ offers: json.data.offers, isLoading: false, error: null })
                return json.data.offers;
            } else {
                const errorText = await response.text();
                set({ isLoading: false, error: `Failed to fetch offers: ${response.status} ${errorText}` })
                return [];
            }
        } catch (e) {
            console.log(e)
            set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to fetch offers' })
            return [];
        }
    },
}))

