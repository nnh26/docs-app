import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 401 });
  }

  const { data: owned, error: ownedError } = await supabase
    .from("documents")
    .select("id, title, content, updated_at, owner_id, owner:users!owner_id(name)")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  const { data: shared, error: sharedError } = await supabase
    .from("shares")
    .select("document:documents(id, title, updated_at, owner_id, owner:users!owner_id(name))")
    .eq("user_id", userId);

  if (ownedError || sharedError) {
    console.error("owned error:", ownedError, "shared error:", sharedError);
    return NextResponse.json({ error: "Could not load documents" }, { status: 500 });
  }

  return NextResponse.json({
    owned: owned ?? [],
    shared: (shared ?? []).map((row) => row.document),
  });
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "Untitled document";

  if (title.length > 200) {
    return NextResponse.json({ error: "Title is too long" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({ owner_id: userId, title })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create document" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}