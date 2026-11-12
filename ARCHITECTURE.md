# Architecture note

## Goal

Ship the strongest working slice of a collaborative document editor in a 4-hour timebox: create and edit rich text, upload a file, share with another user, and persist everything, with a live deployment and an automated test.

## Stack and why

- **Next.js (App Router) for both frontend and backend.** Pages and API routes live in one project, so there is one thing to run, one thing to deploy, and no separate server to host.
- **Supabase (Postgres) for storage.** Real relational data fits documents, owners, and shares, and it has a free tier reviewers do not have to pay for. I had used it before, so it cost me no ramp-up time.
- **Tiptap for the editor.** It provides the required formatting (bold, italic, underline, headings, lists) out of the box on top of ProseMirror, so I spent my time on the product flow instead of building an editor.
- **Vercel for hosting.** Deploys straight from GitHub with environment variables, so the live URL stays in sync with the code.

## Data model

- `users` (id, name): seeded with Alice, Bob, and Carol
- `documents` (id, owner_id, title, content, updated_at): content is stored as HTML from the editor, so formatting survives a reload
- `shares` (document_id, user_id): one row per person a document is shared with

## How access works

One rule decides everything: a user can open a document if they own it or have a row in `shares`.

- The rule lives in `lib/permissions.ts` as a plain function with no database code, so it can be unit tested quickly.
- `lib/access.ts` loads the document and its shares and applies that rule. Every document route calls it first and returns 404 (not found) or 403 (no access) before doing anything else.
- Only the owner can share a document. Shared users can read and edit.

## Request flow

The browser stores the selected user in `localStorage` and sends their ID in an `x-user-id` header on each API call. API routes run on the server and talk to Supabase with a secret key that never reaches the browser. Row Level Security is enabled on all tables, so the public key cannot read them.

## What I prioritized

1. **A complete working path first.** Create, edit, reload, share, and view as the other user, end to end, before polishing anything.
2. **One clear permission rule used everywhere**, instead of scattered checks, so sharing behavior is easy to reason about and test.
3. **Validation and clear errors** on every route (empty titles, bad file types, oversized files, sharing with yourself).
4. **Deployment and tests early**, because those are the parts that tend to fail late.

## What I deliberately cut

- **Real authentication.** The user switcher is a mocked login, which the assignment allows. It means anyone can pick any user, so it is not secure. Supabase Auth plus row-level security policies would be the first upgrade.
- **Real-time collaboration.** Simultaneous edits to one document result in last-save-wins.
- **Unsharing, deleting documents, and view-only permissions.**
- **`.docx` import.** Upload supports `.txt` and `.md` only, and the limit is stated in the UI.

## Testing

Vitest unit tests cover the access rule: the owner can access, a shared user can access, a stranger cannot, and nothing leaks when nothing is shared. I also tested the full flow by hand on the live deployment: create, edit, refresh, share, view as the shared user, upload, and the blocked-access case.

## Next steps with 2 to 4 more hours

1. Replace the mocked login with Supabase Auth and enforce access with row-level security policies
2. Edit vs view-only permissions, and the ability to remove access
3. Export to PDF or Markdown, and `.docx` import
4. Version history and better handling of simultaneous edits