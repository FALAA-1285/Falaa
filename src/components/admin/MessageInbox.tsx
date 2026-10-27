"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { ContactMessage } from "@/types/portfolio";
import {
  toggleMessageReadAction,
  deleteMessageAction,
} from "@/actions/admin/messages";
import { createSafeMailtoUrl } from "@/lib/security";

interface MessageInboxProps {
  initialMessages: ContactMessage[];
}

export default function MessageInbox({ initialMessages }: MessageInboxProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    initialMessages[0] || null
  );

  const handleToggleRead = async (id: number, currentStatus: boolean) => {
    try {
      const res = await toggleMessageReadAction(id, !currentStatus);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_read: !currentStatus } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, is_read: !currentStatus } : null
          );
        }
        router.refresh();
      }
    } catch {
      alert("Gagal memperbarui status pesan.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus pesan ini dari database?")) return;
    try {
      const res = await deleteMessageAction(id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus pesan.");
    }
  };

  const filteredMessages = messages.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q) ||
      (m.subject && m.subject.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (filter === "UNREAD") return !m.is_read;
    if (filter === "READ") return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-black" />
            <span>Kotak Masuk Pesan &amp; Pertanyaan (Inquiries)</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Kelola pesan yang dikirim oleh pengunjung atau calon rekanan melalui formulir kontak portofolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold shadow-xs">
            {unreadCount} Belum Dibaca
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200">
            Total {messages.length}
          </span>
        </div>
      </div>

      {/* Main Inbox Workspace (Split 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Messages List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pengirim, email, subjek..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400 ml-1" />
              {(["ALL", "UNREAD", "READ"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    filter === type
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {type === "ALL" ? "Semua" : type === "UNREAD" ? "Belum Dibaca" : "Sudah Dibaca"}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredMessages.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center text-neutral-400">
                <Mail className="w-8 h-8 mx-auto text-neutral-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-neutral-600">Tidak ada pesan yang cocok.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.is_read) {
                        handleToggleRead(msg.id, false);
                      }
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        setTimeout(() => {
                          document.getElementById("message-detail-view")?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-neutral-900 text-white border-black shadow-sm"
                        : msg.is_read
                        ? "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                        : "bg-neutral-50 text-neutral-900 border-neutral-300 font-semibold shadow-xs"
                    }`}
                  >
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-black absolute top-4 right-4" />
                    )}

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold truncate">
                        {msg.name}
                      </span>
                      <span className={`text-[10px] shrink-0 ${isSelected ? "text-neutral-400" : "text-neutral-500"}`}>
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className={`text-xs truncate ${isSelected ? "text-neutral-200 font-medium" : "text-neutral-800"}`}>
                      {msg.subject || "(Tanpa Subjek)"}
                    </p>

                    <p className={`text-[11px] line-clamp-2 mt-1 ${isSelected ? "text-neutral-400" : "text-neutral-500"}`}>
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Message Detail */}
        <div id="message-detail-view" className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 sm:p-8 space-y-6 relative overflow-hidden">
              {/* Silhouette accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-100/50 rounded-full blur-xl pointer-events-none" />

              {/* Mobile Back Button */}
              <div className="lg:hidden pb-2 border-b border-neutral-100">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black py-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke daftar pesan</span>
                </button>
              </div>

              {/* Header actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.is_read)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition"
                  >
                    {selectedMessage.is_read ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Tandai Belum Dibaca</span>
                      </>
                    ) : (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        <span>Tandai Sudah Dibaca</span>
                      </>
                    )}
                  </button>

                  {createSafeMailtoUrl(selectedMessage.email) !== "#" && (
                    <a
                      href={createSafeMailtoUrl(
                        selectedMessage.email,
                        `Re: ${selectedMessage.subject || "Pesan dari Portofolio"}`
                      )}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white hover:bg-neutral-800 transition shadow-xs"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Balas Email</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                  title="Hapus Pesan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-neutral-900">
                    {selectedMessage.subject || "Pesan dari Formulir Kontak"}
                  </h3>
                  <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                  <div>
                    <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] mr-2">
                      Pengirim:
                    </span>
                    <strong className="text-neutral-900 font-bold">{selectedMessage.name}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] mr-2">
                      Email:
                    </span>
                    {createSafeMailtoUrl(selectedMessage.email) !== "#" ? (
                      <a
                        href={createSafeMailtoUrl(selectedMessage.email)}
                        className="font-mono text-black underline"
                      >
                        {selectedMessage.email}
                      </a>
                    ) : (
                      <span className="font-mono text-black">{selectedMessage.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                  Isi Pesan:
                </span>
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 text-neutral-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400">
              <Mail className="w-10 h-10 mx-auto text-neutral-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-neutral-700">Pilih pesan di sebelah kiri untuk melihat isi detail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
