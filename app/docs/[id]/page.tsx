"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Editor from "@/app/components/Editor";
import SharePanel from "@/app/components/SharePanel";
import { api, getCurrentUserId } from "@/lib/api";

type Doc = {
  id: string;
  title: string;
  content: string;
  isOwner: boolean;
  owner: { name: string } | null;
};

function DocContent() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!getCurrentUserId()) return;
    api(`/api/documents/${id}`)
      .then((d) => {
        setDoc(d);
        setTitle(d.title);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function save(fields: { title?: string; content?: string }) {
    setStatus("Saving...");
    try {
      await api(`/api/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(fields),
      });
      setStatus("Saved");
      setError("");
    } catch (e) {
      setStatus("");
      setError((e as Error).message);
    }
  }

  function onContentChange(html: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save({ content: html }), 800);
  }

  function onTitleBlur() {
    if (doc && title.trim() && title !== doc.title) {
      save({ title });
      setDoc({ ...doc, title });
    } else if (!title.trim() && doc) {
      setTitle(doc.title);
    }
  }

  if (error && !doc) {
    return (
      <div>
        <p className="mb-4 text-red-500">{error}</p>
        <Link href="/" className="underline">
          Back to documents
        </Link>
      </div>
    );
  }

  if (!doc) return <p className="text-sm opacity-70">Loading...</p>;

  return (
    <div>
      <Link href="/" className="text-sm underline">
        Back to documents
      </Link>
      <div className="my-4 flex items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={onTitleBlur}
          maxLength={200}
          className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold hover:border-gray-500 focus:border-gray-500 focus:outline-none"
        />
        <span className="whitespace-nowrap text-sm opacity-70">{status}</span>
      </div>
      <p className="mb-3 text-xs opacity-70">
        {doc.isOwner
          ? "You own this document"
          : `Shared by ${doc.owner?.name ?? "someone"}`}
      </p>
      {doc.isOwner && <SharePanel docId={doc.id} />}
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      <Editor content={doc.content} onChange={onContentChange} />
    </div>
  );
}

export default function DocPage() {
  return (
    <Suspense fallback={<p className="text-sm opacity-70">Loading...</p>}>
      <DocContent />
    </Suspense>
  );
}