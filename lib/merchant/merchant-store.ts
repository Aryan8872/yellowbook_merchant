import { create } from "zustand";
import { CreateMerchantDTO, CreateMerchantStaff } from "../types/dto/merchant-dto";

interface ApiResult<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

interface MerchantStoreState {
    isLoading: boolean;
    createBranch: (merchantId: string, data: CreateMerchantDTO) => Promise<ApiResult>;
    updateBranch: (merchantId: string, branchId: string, data: Partial<CreateMerchantDTO>) => Promise<ApiResult>;
    createMerchantStaff: (merchantId: string, data: CreateMerchantStaff) => Promise<ApiResult>;
}

export const useMerchantStore = create<MerchantStoreState>((set) => {
    async function request(url: string, method: string, body: unknown, fallback: string): Promise<ApiResult> {
        set({ isLoading: true });
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                return { success: false, message: json.message ?? fallback };
            }
            return json;
        } catch (e) {
            return { success: false, message: e instanceof Error ? e.message : fallback };
        } finally {
            set({ isLoading: false });
        }
    }

    return {
        isLoading: false,
        createMerchantStaff: (merchantId, data) =>
            request(`/api/merchants/${merchantId}/staff`, "POST", data, "Failed to create staff"),
        createBranch: (merchantId, data) =>
            request(`/api/merchants/${merchantId}/branches`, "POST", data, "Failed to create branch"),
        updateBranch: (merchantId, branchId, data) =>
            request(`/api/merchants/${merchantId}/branches/${branchId}`, "PATCH", data, "Failed to update branch"),
    };
});