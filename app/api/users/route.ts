import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Could not load users" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}