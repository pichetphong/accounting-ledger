'use client';

import { useCallback, useRef, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const DEFAULT_OPTIONS = {
  title: 'Are you sure?',
  description: null,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'primary',
};

// Usage:
//   const { confirm, dialog } = useConfirm();
//   ...
//   const handleRemove = async () => {
//     if (await confirm({ title, description, variant: 'destructive' })) {
//       removeCategory(name);
//     }
//   };
//   return (<>{...page...}{dialog}</>);
export default function useConfirm() {
  const [state, setState] = useState({ open: false, options: DEFAULT_OPTIONS });
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      // If a previous prompt is still open, resolve it as cancelled before
      // replacing it — keeps the resolver chain from leaking promises.
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      setState({
        open: true,
        options: { ...DEFAULT_OPTIONS, ...options },
      });
    });
  }, []);

  const settle = useCallback((value) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
    if (resolve) resolve(value);
  }, []);

  const handleClose = useCallback(() => settle(false), [settle]);
  const handleConfirm = useCallback(() => settle(true), [settle]);

  const dialog = (
    <ConfirmDialog
      open={state.open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={state.options.title}
      description={state.options.description}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      variant={state.options.variant}
    />
  );

  return { confirm, dialog };
}
