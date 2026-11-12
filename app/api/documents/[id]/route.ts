import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkDocumentAccess } from "@/lib/access";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 401 });
  }

  const access = await checkDocumentAccess(id, userId);
  if (!access.exists) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!access.allowed) {
    return NextResponse.json({ error: "You do not have access" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, content, updated_at, owner_id, owner:users!owner_id(name)")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("load doc error:", error);
    return NextResponse.json({ error: "Could not load document" }, { status: 500 });
  }

  return NextResponse.json({ ...data, isOwner: access.isOwner });
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 401 });
  }

  const access = await checkDocumentAccess(id, userId);
  if (!access.exists) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!access.allowed) {
    return NextResponse.json({ error: "You do not have access" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: { title?: string; content?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (body.title.length > 200) {
      return NextResponse.json({ error: "Title is too long" }, { status: 400 });
    }
    updates.title = body.title.trim();
  }

  if (body.content !== undefined) {
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "Content must be text" }, { status: 400 });
    }
    updates.content = body.content;
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select("id, title, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save document" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: Context) {
  const { id } = await params;
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 401 });
  }

  const access = await checkDocumentAccess(id, userId);
  if (!access.exists) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!access.isOwner) {
    return NextResponse.json(
      { error: "Only the owner can delete this document" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not delete document" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}