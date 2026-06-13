'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function CategoryPicker({
  value,
  categories,
  onSelect,
  onCreate,
  placeholder = 'Select a category',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  const filtered = useMemo(() => {
    if (!trimmedQuery) return categories;
    return categories.filter((c) => c.toLowerCase().includes(lowerQuery));
  }, [categories, lowerQuery, trimmedQuery]);

  const exactMatch = useMemo(
    () =>
      trimmedQuery.length > 0 &&
      categories.some((c) => c.toLowerCase() === lowerQuery),
    [categories, lowerQuery, trimmedQuery],
  );

  const showCreateRow = trimmedQuery.length > 0 && !exactMatch;

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleSelect = (name) => {
    onSelect?.(name);
    setOpen(false);
    setQuery('');
  };

  const handleCreate = async () => {
    if (!trimmedQuery) return;
    const result = await Promise.resolve(onCreate?.(trimmedQuery));
    if (result?.ok) {
      onSelect?.(result.name ?? trimmedQuery);
    } else if (result?.reason === 'duplicate') {
      onSelect?.(trimmedQuery);
    }
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-[42px] px-[14px] rounded-[12px] bg-[var(--color-surface-inset)] text-[14px] text-left border-[3px] border-black outline-none focus:border-[5px] flex items-center justify-between"
      >
        <span className={value ? 'text-[var(--color-text)]' : 'text-[var(--color-text-subtle)]'}>
          {value || placeholder}
        </span>
        <span className="text-[var(--color-text-muted)] text-[12px] ml-2">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 bg-[var(--color-surface)] rounded-[12px] border-[3px] border-black p-2 max-h-[280px] overflow-hidden flex flex-col">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create..."
            className="h-[36px] px-[12px] mb-2 rounded-[10px] bg-[var(--color-surface-inset)] text-[13px] border-[3px] border-black outline-none focus:border-[5px]"
          />

          <div className="overflow-y-auto flex flex-col gap-[2px] pr-1">
            {filtered.length === 0 && !showCreateRow && (
              <div className="px-3 py-2 text-[13px] text-[var(--color-text-subtle)]">
                No categories.
              </div>
            )}

            {filtered.map((c) => {
              const isActive = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`text-left px-3 py-2 rounded-[8px] text-[13px] transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {c}
                </button>
              );
            })}

            {showCreateRow && (
              <button
                type="button"
                onClick={handleCreate}
                className="text-left px-3 py-2 rounded-[8px] text-[13px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] border-t border-[var(--color-divider)] mt-1 pt-2"
              >
                + Create &quot;{trimmedQuery}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
