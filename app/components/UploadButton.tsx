"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/api";

export default function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-user-id": getCurrentUserId() ?? "" },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      router.push(`/docs/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        onChange={onPick}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded border border-gray-500 px-4 py-2 text-sm font-medium hover:bg-gray-500/10 disabled:opacity-50"
      >
        {busy ? "Uploading..." : "Upload file"}
      </button>
      <span className="mt-1 text-xs opacity-70">Supports .txt and .md (max 1 MB)</span>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
}