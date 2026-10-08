import { useMerchantStore } from "./merchant-store"

export const useMerchant = () => {
    const createBranch = useMerchantStore((s) => s.createBranch)
    const createStaff = useMerchantStore((s) => s.createMerchantStaff)
    const updateBranch = useMerchantStore((s) => s.updateBranch)
    const isLoading = useMerchantStore((s) => s.isLoading)
    return { createBranch, createStaff, updateBranch, isLoading }
}