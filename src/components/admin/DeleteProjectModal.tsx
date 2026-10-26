"use client";

import React, { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteProjectAction } from "@/actions/admin/projects";

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: { id: string; title: string } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteProjectModal({
  isOpen,
  project,
  onClose,
  onSuccess,
}: DeleteProjectModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !project) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(result.error || "Gagal menghapus project.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-neutral-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-neutral-900">
              Konfirmasi Hapus Project
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-neutral-900">{project.title}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isPending ? "Menghapus..." : "Ya, Hapus"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
