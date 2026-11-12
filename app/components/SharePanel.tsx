"use client";

import { useEffect, useState } from "react";
import { api, getCurrentUserId } from "@/lib/api";

type User = { id: string; name: string };

export default function SharePanel({ docId }: { docId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [sharedWith, setSharedWith] = useState<User[]>([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [allUsers, shares] = await Promise.all([
        api("/api/users"),
        api(`/api/documents/${docId}/share`),
      ]);
      setUsers(allUsers);
      setSharedWith(shares.sharedWith);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const me = getCurrentUserId();
  const options = users.filter(
    (u) => u.id !== me && !sharedWith.some((s) => s.id === u.id)
  );

  async function share() {
    setError("");
    setMessage("");
    if (!selected) {
      setError("Pick a user first");
      return;
    }
    try {
      const res = await api(`/api/documents/${docId}/share`, {
        method: "POST",
        body: JSON.stringify({ userId: selected }),
      });
      setMessage(`Shared with ${res.user.name}`);
      setSelected("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="mb-4 rounded border border-gray-400 p-3 text-sm">
      <div className="mb-2 font-medium">Share this document</div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded border bg-white px-2 py-1 text-black"
        >
          <option value="">Choose a user</option>
          {options.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          onClick={share}
          className="rounded border border-gray-500 px-3 py-1 hover:bg-gray-500/10"
        >
          Share
        </button>
        {message && <span className="text-green-500">{message}</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
      <div className="mt-2 text-xs opacity-70">
        {sharedWith.length > 0
          ? `Shared with: ${sharedWith.map((s) => s.name).join(", ")}`
          : "Not shared with anyone yet"}
      </div>
    </div>
  );
}