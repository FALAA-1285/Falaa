"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Project } from "@/types/portfolio";
import { sanitizeImageUrl } from "@/lib/security";
import { reorderProjectsAction } from "@/actions/admin/reorder";
import { deleteProjectAction } from "@/actions/admin/projects";
import { ConfirmDialog } from "./Dialog";
import PageHead from "./PageHead";

interface ProjectTableProps {
  initialProjects: Project[];
}

export default function ProjectTable({ initialProjects }: ProjectTableProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;

    const previous = projects;
    const updated = [...projects];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setProjects(updated);
    setIsReordering(true);
    setError(null);

    try {
      const res = await reorderProjectsAction(updated.map((p) => p.id));
      if (!res.success) {
        setProjects(previous);
        setError(res.error || "Urutan project gagal disimpan.");
      } else {
        router.refresh();
      }
    } catch {
      setProjects(previous);
      setError("Urutan project gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsReordering(false);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      const res = await deleteProjectAction(deleteTarget.id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        router.refresh();
      } else {
        setDeleteTarget(null);
        setError(res.error || "Project gagal dihapus.");
      }
    });
  };

  return (
    <>
      <PageHead
        title="Project"
        lede="Urutan di daftar ini sama dengan urutan tampil di situs."
        action={
          <Link href="/admin/projects/new" className="adm-btn adm-btn-primary">
            Tambah project
          </Link>
        }
      />

      {error && <div className="adm-notice adm-notice-error mb-4">{error}</div>}

      <div className="adm-panel">
        {projects.length === 0 ? (
          <div className="adm-section adm-meta">
            Belum ada project. Tambahkan yang pertama agar bagian Project di situs terisi.
          </div>
        ) : (
          projects.map((project, index) => {
            const image = sanitizeImageUrl(project.image);
            return (
              <div key={project.id} className="adm-row">
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="adm-icon-btn adm-icon-btn-sm"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0 || isReordering}
                    aria-label={`Naikkan ${project.title}`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn adm-icon-btn-sm"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === projects.length - 1 || isReordering}
                    aria-label={`Turunkan ${project.title}`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  className="relative w-16 h-11 shrink-0 overflow-hidden rounded"
                  style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={image.endsWith(".svg")}
                  />
                </div>

                <Link href={`/admin/projects/${project.id}/edit`} className="min-w-0 flex-1 group">
                  <span className="block font-medium truncate group-hover:underline">
                    {project.title}
                  </span>
                  <span className="adm-meta block truncate">{project.category}</span>
                </Link>

                <span className="adm-faint hidden md:block truncate max-w-[220px]">
                  {project.tags.join(", ")}
                </span>

                <div className="flex shrink-0">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="adm-icon-btn"
                    aria-label={`Edit ${project.title}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    className="adm-icon-btn adm-icon-btn-danger"
                    onClick={() => setDeleteTarget(project)}
                    aria-label={`Hapus ${project.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus project?"
        message={
          <>
            <strong style={{ color: "var(--ink)" }}>{deleteTarget?.title}</strong> akan dihapus dari
            situs. Tindakan ini tidak bisa dibatalkan.
          </>
        }
        confirmLabel="Hapus project"
        pending={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
