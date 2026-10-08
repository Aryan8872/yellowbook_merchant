import { useBranchStore } from './branch-store';

export function useBranch() {
  const branches = useBranchStore((s) => s.branches);
  const isLoading = useBranchStore((s) => s.isLoading);
  const listBranches = useBranchStore((s) => s.listBranches);
  const createBranch = useBranchStore((s) => s.createBranch);
  const updateBranch = useBranchStore((s) => s.updateBranch);
  const deleteBranch = useBranchStore((s) => s.deleteBranch);
  const toggleBranchActive = useBranchStore((s) => s.toggleBranchActive);

  return {
    branches,
    isLoading,
    listBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchActive,
  };
}
