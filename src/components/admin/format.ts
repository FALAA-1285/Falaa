const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

/** Short timestamp for lists, e.g. "30 Okt 14.05". */
export function formatShortDate(value: string | Date): string {
  return dateFormatter.format(new Date(value)).replace(",", "");
}

/** Full timestamp for detail views, e.g. "30 Oktober 2026 pukul 14.05". */
export function formatFullDate(value: string | Date): string {
  return fullDateFormatter.format(new Date(value));
}
