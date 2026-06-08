'use client';

import { useCategoriesRemote } from '@/lib/queries/categories';

// Thin wrapper kept so existing callers (CategoryPicker, EntryForm, settings
// page) don't need to know whether categories come from localStorage or
// Supabase. As of Phase 2 the source is Supabase; the previous localStorage
// path is gone but the mockCategories seed in lib/mockData.js still feeds
// the one-shot migration for brand-new users.
//
// API changes vs Phase 1:
//   - addCategory / removeCategory / renameCategory now return Promises.
//   - `hydrated` is replaced by `loading` (true while the initial fetch is
//     in flight). Callers that still read `hydrated` see it as `!loading`.
export default function useCategories() {
  const remote = useCategoriesRemote();
  return {
    categories: remote.categories,
    loading: remote.loading,
    hydrated: !remote.loading,
    error: remote.error,
    addCategory: remote.addCategory,
    removeCategory: remote.removeCategory,
    renameCategory: remote.renameCategory,
    refetch: remote.refetch,
  };
}
