"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Project } from "@/types/portfolio";
import { CATEGORIES } from "@/lib/schemas/project";
import { isSafeUrl, sanitizeImageUrl } from "@/lib/security";
import { reorderProjectsAction } from "@/actions/admin/reorder";
import DeleteProjectModal from "./DeleteProjectModal";

interface ProjectTableProps {
  initialProjects: Project[];
}

type SortField = "order" | "title" | "category" | "id";
type SortOrder = "asc" | "desc";

export default function ProjectTable({ initialProjects }: ProjectTableProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("order");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isReordering, setIsReordering] = useState(false);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Reordering handler
  const handleMove = async (projectId: string, direction: "up" | "down") => {
    const currentList = [...projects];
    const currentIndex = currentList.findIndex((p) => p.id === projectId);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === currentList.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const [moved] = currentList.splice(currentIndex, 1);
    currentList.splice(targetIndex, 0, moved);

    const reordered = currentList.map((p, idx) => ({ ...p, order_index: idx }));
    setProjects(reordered);
    setIsReordering(true);

    try {
      const res = await reorderProjectsAction(reordered.map((p) => p.id));
      if (!res.success) {
        alert(res.error || "Gagal mengubah urutan project.");
        setProjects(projects);
      } else {
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat menyimpan urutan.");
      setProjects(projects);
    } finally {
      setIsReordering(false);
    }
  };

  // Filtered & Sorted Projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter((p) => !deletedIds.includes(p.id));

    // 1. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortField === "order") {
        const ordA = a.order_index ?? 0;
        const ordB = b.order_index ?? 0;
        return sortOrder === "asc" ? ordA - ordB : ordB - ordA;
      }

      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, deletedIds, search, selectedCategory, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = filteredAndSortedProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProjects = filteredAndSortedProjects.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteSuccess = () => {
    if (deleteTarget) {
      setDeletedIds((prev) => [...prev, deleteTarget.id]);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan judul, teknologi, atau slug..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
          />
        </div>

        {/* Category & PageSize Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm border border-neutral-300 rounded-md px-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="ALL">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>Per hal:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-neutral-300 rounded px-2 py-1 bg-white text-neutral-800 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-md transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Project</span>
          </Link>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] text-left text-sm text-neutral-700">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500 tracking-wider">
              <tr>
                <th
                  className="py-3.5 px-3 w-20 cursor-pointer hover:text-black transition select-none"
                  onClick={() => handleSort("order")}
                >
                  <div className="flex items-center gap-1">
                    <span>Urutan</span>
                    {sortField === "order" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-black" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 w-16">Preview</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-black transition select-none"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Judul & Slug</span>
                    {sortField === "title" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-black" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-black transition select-none"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kategori</span>
                    {sortField === "category" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-black" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 hidden md:table-cell">Tags</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-8 h-8 text-neutral-300 stroke-[1.5]" />
                      <p className="text-sm font-medium text-neutral-600">
                        Tidak ada project yang ditemukan.
                      </p>
                      <p className="text-xs text-neutral-400">
                        Coba ubah kata kunci pencarian atau filter kategori.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project, index) => {
                  const safeImage = sanitizeImageUrl(project.image);
                  const safeLiveUrl = isSafeUrl(project.liveUrl) ? project.liveUrl : null;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-neutral-50/80 transition-colors"
                    >
                      {/* Urutan */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-neutral-400 w-5 text-center">
                            #{(project.order_index ?? 0) + 1}
                          </span>
                          {sortField === "order" && selectedCategory === "ALL" && !search.trim() && (
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => handleMove(project.id, "up")}
                                disabled={startIndex + index === 0 || isReordering}
                                className="p-1 rounded hover:bg-neutral-200 disabled:opacity-20 text-neutral-600 transition cursor-pointer"
                                title="Pindahkan ke atas"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMove(project.id, "down")}
                                disabled={startIndex + index === filteredAndSortedProjects.length - 1 || isReordering}
                                className="p-1 rounded hover:bg-neutral-200 disabled:opacity-20 text-neutral-600 transition cursor-pointer"
                                title="Pindahkan ke bawah"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-9 rounded bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                          <Image
                            src={safeImage}
                            alt={project.title}
                            fill
                            className="object-cover"
                            unoptimized={safeImage.endsWith(".svg")}
                          />
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 line-clamp-1">
                          {project.title}
                        </div>
                        <div className="text-xs text-neutral-400 font-mono">
                          id: {project.id}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {project.category}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {project.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="text-[11px] text-neutral-400">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {safeLiveUrl && (
                            <a
                              href={safeLiveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 sm:p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
                              title="Buka Demo"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="p-2 sm:p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            className="p-2 sm:p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                            title="Hapus Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <div>
              Menampilkan{" "}
              <strong className="text-neutral-900 font-semibold">
                {startIndex + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-neutral-900 font-semibold">
                {Math.min(startIndex + pageSize, totalItems)}
              </strong>{" "}
              dari{" "}
              <strong className="text-neutral-900 font-semibold">
                {totalItems}
              </strong>{" "}
              project
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`w-7 h-7 rounded text-xs font-medium transition ${
                    currentPage === p
                      ? "bg-black text-white"
                      : "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={deleteTarget !== null}
        project={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
