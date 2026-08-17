export type IPostFilterRequest = {
  searchTerm?: string;
  // 'all' returns every post regardless of status (dashboard use).
  // A specific value ('draft' | 'published') filters to just that status.
  // Omitted entirely defaults to "not draft" (published + legacy posts
  // saved before this field existed) — the safe default for public use.
  status?: string;
};
