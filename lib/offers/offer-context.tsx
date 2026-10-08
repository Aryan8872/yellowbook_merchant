import { useOfferStore } from "./offer-store";
export function useOffer(){
    const getOffers= useOfferStore((s)=>s.getOffers);
    const offers= useOfferStore((s)=>s.offers);
    const isLoading= useOfferStore((s)=>s.isLoading);
    const error= useOfferStore((s)=>s.error);
    const clearError= useOfferStore((s)=>s.clearError);
    const searchParams = useOfferStore((s)=>s.searchParams);
    const setSearchParams = useOfferStore((s)=>s.setSearchParams);
    return{
        getOffers,
        searchParams,
        setSearchParams,
        offers,
        isLoading,
        error,
        clearError
    }
}