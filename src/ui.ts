export function setSyncStatus(text: string, type: string = ""): void {
  if (typeof document === "undefined") return;
  const statusEl = document.getElementById("sync-status");
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.display = "flex";
  statusEl.style.opacity = "1";
  statusEl.className = `sync-status ${type}`;
  if (type === "online") {
    setTimeout(() => { statusEl.style.opacity = "0"; }, 3000);
  }
}
