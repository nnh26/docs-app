import { supabase } from "./supabase";
import { canAccess } from "./permissions";

export async function checkDocumentAccess(documentId: string, userId: string) {
  const { data: doc } = await supabase
    .from("documents")
    .select("id, owner_id")
    .eq("id", documentId)
    .single();

  if (!doc) return { exists: false, allowed: false, isOwner: false };

  const { data: shares } = await supabase
    .from("shares")
    .select("user_id")
    .eq("document_id", documentId);

  const sharedIds = (shares ?? []).map((s) => s.user_id);

  return {
    exists: true,
    allowed: canAccess(doc.owner_id, userId, sharedIds),
    isOwner: doc.owner_id === userId,
  };
}