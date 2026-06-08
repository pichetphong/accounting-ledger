'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (onConfirm) onConfirm();
  }, [onConfirm]);

  // Body scroll lock + remember the focused element so we can restore it.
  useEffect(() => {
    if (!open) return undefined;
    previouslyFocusedRef.current =
      typeof document !== 'undefined' ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [open]);

  // Autofocus the safer (cancel) action once the dialog mounts.
  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  // Keyboard: Escape closes, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        handleClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const container = dialogRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, handleClose]);

  if (typeof window === 'undefined') return null;
  if (!open) return null;

  const confirmVariant = variant === 'destructive' ? 'destructive' : 'primary';

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  return createPortal(
    <div
      onMouseDown={handleBackdropMouseDown}
      className="confirm-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: 'rgba(62, 39, 35, 0.45)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="confirm-dialog-surface w-full max-w-[420px] rounded-[16px] bg-white p-6"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h3
          id={titleId}
          className="font-display text-[20px] leading-[28px] text-[var(--color-primary)]"
        >
          {title}
        </h3>
        {description !== undefined && description !== null && (
          <div
            id={descriptionId}
            className="mt-3 text-[14px] leading-[22px] text-[var(--color-text-muted)]"
          >
            {description}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            ref={cancelButtonRef}
            variant="ghost"
            size="md"
            onClick={handleClose}
          >
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} size="md" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
