"use client";

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function Dialog({ open, title, onClose, children, width = 560 }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Callers pass inline handlers; keep the latest one without re-running the open effect
  // (which would steal focus back to the first field on every render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, textarea, select, button[data-autofocus]")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="adm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="adm-dialog"
        style={{ maxWidth: width }}
      >
        <div className="adm-panel-head">
          <h2 id={titleId} className="adm-h2">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="adm-icon-btn" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose} width={420}>
      <p className="adm-meta">{message}</p>
      <div className="flex justify-end gap-2 mt-5">
        <button type="button" className="adm-btn" onClick={onClose} disabled={pending} data-autofocus>
          Batal
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-danger"
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "Menghapus…" : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
