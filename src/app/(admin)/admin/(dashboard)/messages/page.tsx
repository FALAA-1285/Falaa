import React, { Suspense } from "react";
import { getMessages } from "@/lib/db";
import MessageInbox from "@/components/admin/MessageInbox";
import { requireAdminSession } from "@/lib/auth";

interface MessagesPageProps {
  searchParams: Promise<{ m?: string }>;
}

async function MessagesContent({ searchParams }: MessagesPageProps) {
  await requireAdminSession();
  const [messages, { m }] = await Promise.all([getMessages(), searchParams]);
  const selectedId = Number(m);
  return (
    <MessageInbox
      initialMessages={messages}
      initialSelectedId={Number.isInteger(selectedId) && selectedId > 0 ? selectedId : undefined}
    />
  );
}

export default function AdminMessagesPage(props: MessagesPageProps) {
  return (
    <Suspense fallback={<p className="adm-meta">Memuat pesan…</p>}>
      <MessagesContent {...props} />
    </Suspense>
  );
}
