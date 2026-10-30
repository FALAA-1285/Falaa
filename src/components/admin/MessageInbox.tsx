"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ContactMessage } from "@/types/portfolio";
import { toggleMessageReadAction, deleteMessageAction } from "@/actions/admin/messages";
import { createSafeMailtoUrl } from "@/lib/security";
import { ConfirmDialog } from "./Dialog";
import PageHead from "./PageHead";
import { formatFullDate, formatShortDate } from "./format";

interface MessageInboxProps {
  initialMessages: ContactMessage[];
  initialSelectedId?: number;
}

export default function MessageInbox({ initialMessages, initialSelectedId }: MessageInboxProps) {
  const router = useRouter();
  // A message opened by link (?m=) counts as read immediately.
  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    initialMessages.map((m) => (m.id === initialSelectedId ? { ...m, is_read: true } : m))
  );
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId ?? null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    const opened = initialMessages.find((m) => m.id === initialSelectedId);
    if (opened && !opened.is_read) {
      toggleMessageReadAction(opened.id, true).then(() => router.refresh());
    }
  }, [initialMessages, initialSelectedId, router]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const unreadCount = messages.filter((m) => !m.is_read).length;

  const q = search.toLowerCase().trim();
  const visible = messages.filter((m) => {
    if (onlyUnread && m.is_read) return false;
    if (!q) return true;
    return [m.name, m.email, m.subject ?? "", m.message].some((v) => v.toLowerCase().includes(q));
  });

  const setRead = async (id: number, isRead: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m)));
    try {
      const res = await toggleMessageReadAction(id, isRead);
      if (!res.success) throw new Error(res.error);
      router.refresh();
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: !isRead } : m)));
      setError("Status pesan gagal diubah. Coba lagi.");
    }
  };

  const open = (msg: ContactMessage) => {
    setSelectedId(msg.id);
    setError(null);
    if (!msg.is_read) setRead(msg.id, true);
  };

  const handleDelete = () => {
    if (!selected) return;
    const id = selected.id;
    startDelete(async () => {
      const res = await deleteMessageAction(id);
      setConfirmDelete(false);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setSelectedId(null);
        router.refresh();
      } else {
        setError(res.error || "Pesan gagal dihapus.");
      }
    });
  };

  const replyUrl = selected
    ? createSafeMailtoUrl(selected.email, `Re: ${selected.subject || "Pesan dari portofolio"}`)
    : "#";

  return (
    <>
      <PageHead
        title="Pesan"
        lede={
          messages.length === 0
            ? "Pesan dari formulir kontak di situs akan muncul di sini."
            : `${messages.length} pesan, ${unreadCount} belum dibaca.`
        }
      />

      {error && <div className="adm-notice adm-notice-error mb-4">{error}</div>}

      {messages.length > 0 && (
        <div className="adm-panel lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden">
          {/* List */}
          <div
            className={`${selected ? "hidden lg:flex" : "flex"} flex-col min-h-0 lg:border-r`}
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-2 p-3" style={{ borderBottom: "1px solid var(--line)" }}>
              <input
                type="search"
                className="adm-input"
                placeholder="Cari nama, email, atau isi"
                aria-label="Cari pesan"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label className="flex items-center gap-1.5 text-[13px] whitespace-nowrap cursor-pointer" style={{ color: "var(--muted)" }}>
                <input
                  type="checkbox"
                  checked={onlyUnread}
                  onChange={(e) => setOnlyUnread(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
                Belum dibaca
              </label>
            </div>

            <ul className="lg:max-h-[calc(100vh-220px)] overflow-y-auto">
              {visible.length === 0 ? (
                <li className="adm-section adm-meta">Tidak ada pesan yang cocok.</li>
              ) : (
                visible.map((msg) => {
                  const isSelected = msg.id === selectedId;
                  return (
                    <li key={msg.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                      <button
                        type="button"
                        onClick={() => open(msg)}
                        aria-current={isSelected ? "true" : undefined}
                        className="w-full text-left px-4 py-3 cursor-pointer transition-colors hover:bg-(--paper)"
                        style={isSelected ? { background: "var(--accent-soft)" } : undefined}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className={`truncate ${msg.is_read ? "" : "font-semibold"}`}>
                            {!msg.is_read && (
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                                style={{ background: "var(--accent)" }}
                                aria-label="Belum dibaca"
                              />
                            )}
                            {msg.name}
                          </span>
                          <span className="adm-faint shrink-0">{formatShortDate(msg.created_at)}</span>
                        </div>
                        <p className="adm-meta truncate">{msg.subject || msg.message}</p>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Reading pane */}
          <div className={`${selected ? "block" : "hidden lg:block"} min-w-0`}>
            {selected ? (
              <article className="p-5 sm:p-6">
                <button
                  type="button"
                  className="adm-btn adm-btn-quiet lg:hidden mb-3 -ml-2"
                  onClick={() => setSelectedId(null)}
                >
                  Kembali ke daftar
                </button>

                <h2 className="text-[18px] font-semibold leading-snug">
                  {selected.subject || "Tanpa subjek"}
                </h2>
                <p className="adm-meta mt-1">
                  {selected.name}, {selected.email}
                </p>
                <p className="adm-faint">{formatFullDate(selected.created_at)}</p>

                <p className="mt-5 whitespace-pre-wrap leading-relaxed max-w-[65ch]">{selected.message}</p>

                <div className="flex flex-wrap gap-2 mt-6 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
                  {replyUrl !== "#" && (
                    <a href={replyUrl} className="adm-btn adm-btn-primary">
                      Balas lewat email
                    </a>
                  )}
                  <button type="button" className="adm-btn" onClick={() => setRead(selected.id, !selected.is_read)}>
                    {selected.is_read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-quiet ml-auto"
                    style={{ color: "var(--danger)" }}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ) : (
              <p className="adm-section adm-meta">Pilih pesan untuk membacanya.</p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus pesan?"
        message={`Pesan dari ${selected?.name ?? ""} akan dihapus permanen.`}
        confirmLabel="Hapus pesan"
        pending={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
