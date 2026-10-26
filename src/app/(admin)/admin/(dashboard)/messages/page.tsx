import React, { Suspense } from "react";
import { getMessages } from "@/lib/db";
import MessageInbox from "@/components/admin/MessageInbox";

async function MessagesContent() {
  const messages = await getMessages();
  return <MessageInbox initialMessages={messages} />;
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-xs text-neutral-400 font-medium">
          Memuat pesan masuk dari PostgreSQL...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
