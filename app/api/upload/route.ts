import { NextResponse } from "next/server";
import { marked } from "marked";
import { supabase } from "@/lib/supabase";

const MAX_BYTES = 1_000_000;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const lower = file.name.toLowerCase();
  const isMd = lower.endsWith(".md");
  const isTxt = lower.endsWith(".txt");
  if (!isMd && !isTxt) {
    return NextResponse.json(
      { error: "Only .txt and .md files are supported" },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large (limit is 1 MB)" },
      { status: 413 }
    );
  }

  const text = await file.text();
  const html = isMd
    ? await marked.parse(text)
    : text
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
        .join("");

  const title = file.name.replace(/\.(txt|md)$/i, "").slice(0, 200) || "Imported document";

  const { data, error } = await supabase
    .from("documents")
    .insert({ owner_id: userId, title, content: html })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not save the file" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}