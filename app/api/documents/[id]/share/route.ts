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
    .from("shares")
    .select("user:users(id, name)")
    .eq("document_id", id);

  if (error) {
    return NextResponse.json({ error: "Could not load shares" }, { status: 500 });
  }

  return NextResponse.json({ sharedWith: (data ?? []).map((row) => row.user) });
}

export async function POST(request: Request, { params }: Context) {
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
      { error: "Only the owner can share this document" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const targetId = body?.userId;
  if (typeof targetId !== "string" || !targetId) {
    return NextResponse.json({ error: "Pick a user to share with" }, { status: 400 });
  }
  if (targetId === userId) {
    return NextResponse.json(
      { error: "You already own this document" },
      { status: 400 }
    );
  }

  const { data: target } = await supabase
    .from("users")
    .select("id, name")
    .eq("id", targetId)
    .single();

  if (!target) {
    return NextResponse.json({ error: "That user does not exist" }, { status: 404 });
  }

  const { error } = await supabase
    .from("shares")
    .upsert(
      { document_id: id, user_id: targetId },
      { onConflict: "document_id,user_id" }
    );

  if (error) {
    return NextResponse.json({ error: "Could not share document" }, { status: 500 });
  }

  return NextResponse.json({ shared: true, user: target }, { status: 201 });
}