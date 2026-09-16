import "server-only";

export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "—";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
