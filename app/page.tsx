"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getCurrentUserId } from "@/lib/api";
import UploadButton from "@/app/components/UploadButton";

type Doc = {
  id: string;
  title: string;
  updated_at: string;
  owner_id: string;
  owner: { name: string } | null;
};

function DocRow({ doc, shared }: { doc: Doc; shared: boolean }) {
  return (
    <li>
      <Link
        href={`/docs/${doc.id}`}
        className="flex items-center justify-between rounded border border-gray-300 px-4 py-3 hover:border-gray-500"
      >
        <div>
          <div className="font-medium">{doc.title}</div>
          <div className="text-xs opacity-70">
            Updated {new Date(doc.updated_at).toLocaleString()}
          </div>
        </div>
        <span className="rounded-full border border-gray-400 px-2 py-0.5 text-xs">
          {shared ? `Shared by ${doc.owner?.name ?? "someone"}` : "Owned"}
        </span>
      </Link>
    </li>
  );
}

export default function Home() {
  const router = useRouter();
  const [owned, setOwned] = useState<Doc[]>([]);
  const [shared, setShared] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getCurrentUserId()) return;
    api("/api/documents")
      .then((data) => {
        setOwned(data.owned);
        setShared((data.shared as Doc[]).filter(Boolean));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function createDoc() {
    try {
      const doc = await api("/api/documents", {
        method: "POST",
        body: JSON.stringify({}),
      });
      router.push(`/docs/${doc.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <div className="flex items-start gap-3">
          <UploadButton />
          <button
            onClick={createDoc}
            className="rounded border border-gray-500 px-4 py-2 text-sm font-medium hover:bg-gray-500/10"
          >
            New document
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm opacity-70">Loading...</p>}

      <h2 className="mb-2 mt-4 text-lg font-medium">My documents</h2>
      {!loading && owned.length === 0 && (
        <p className="text-sm opacity-70">No documents yet. Create one above.</p>
      )}
      <ul className="space-y-2">
        {owned.map((d) => (
          <DocRow key={d.id} doc={d} shared={false} />
        ))}
      </ul>

      <h2 className="mb-2 mt-8 text-lg font-medium">Shared with me</h2>
      {!loading && shared.length === 0 && (
        <p className="text-sm opacity-70">Nothing has been shared with you yet.</p>
      )}
      <ul className="space-y-2">
        {shared.map((d) => (
          <DocRow key={d.id} doc={d} shared={true} />
        ))}
      </ul>
    </div>
  );
}