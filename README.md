# Docs: a lightweight collaborative document editor

A small full-stack app for creating, editing, uploading, and sharing rich-text documents. Built for the Ajaia AI-Native Full Stack Developer assignment.

**Live app:** https://docs-app-bice.vercel.app/
**Source code:** https://github.com/nnh26/docs-app

## What it does

- Create, rename, edit, and reopen documents in the browser
- Rich-text formatting: bold, italic, underline, two heading sizes, bulleted and numbered lists
- Autosave (about 1 second after you stop typing)
- Upload a `.txt` or `.md` file to turn it into a new editable document
- Share a document with another user, with a clear Owned vs "Shared by NAME" distinction
- Documents, formatting, and sharing persist in a Postgres database

## Try it (test accounts)

There is no password login. To keep the scope focused, users are seeded and you switch between them using the **"Signed in as"** dropdown in the top-right corner.

| User  | Purpose                      |
|-------|------------------------------|
| Alice | Test account                 |
| Bob   | Test account                 |
| Carol | Test account                 |

Suggested review flow for sharing:

1. Sign in as **Bob**, click **New document**, and type some formatted text.
2. In the **Share this document** box, pick **Alice** and click **Share**.
3. Switch to **Alice**. The document appears under **Shared with me** with a "Shared by Bob" badge. Open it and edit it.
4. Switch to **Carol** and open the same document URL directly. She gets "You do not have access".
5. As Bob, click **Upload file** and choose a `.md` or `.txt` file to create a new document from it.

## Supported file types for upload

`.txt` and `.md` only, up to 1 MB. Markdown is converted to rich text (headings, lists, bold, italic). Plain text is split into paragraphs. Other file types are rejected with a clear message. This limit is also shown in the UI next to the upload button.

## Tech stack

- **Next.js** (App Router, TypeScript): frontend pages and backend API routes in one project
- **Tiptap**: rich-text editor
- **Supabase (Postgres)**: storage for users, documents, and shares
- **Tailwind CSS**: styling
- **Vitest**: automated tests
- **Vercel**: hosting

## Run it locally

You need Node.js 18 or newer and a free Supabase project.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the database tables. In your Supabase project, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates the `users`, `documents`, and `shares` tables and seeds Alice, Bob, and Carol.

3. Create a file named `.env.local` in the project root:

   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-secret-key
   ```

   The URL is your Supabase project URL. The key is the **secret key** from Project Settings > API Keys. Keep it private. It is only used on the server and must never be committed.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Run the tests

```bash
npm test
```

The test suite covers the access rule that decides who can open a document: the owner can, a user it was shared with can, and a stranger cannot.

## Project structure

```
app/
  page.tsx                       Document list (owned and shared)
  docs/[id]/page.tsx             Editor page with autosave and sharing
  components/                    Editor, SharePanel, UploadButton, UserSwitcher
  api/documents/                 List and create documents
  api/documents/[id]/            Get, rename, and save one document
  api/documents/[id]/share/      List and add shares (owner only)
  api/upload/                    File upload and conversion
  api/users/                     List users for the switcher and share picker
lib/
  permissions.ts                 Pure access rule (unit tested)
  access.ts                      Looks up the document and shares, applies the rule
  supabase.ts                    Server-side database client
  api.ts                         Browser helper that sends the current user header
supabase/schema.sql              Database schema and seed users
```

## Validation and error handling

- Missing user returns 401; unknown document returns 404; no access returns 403
- Titles cannot be empty or longer than 200 characters
- Uploads reject unsupported types, empty files, and files over 1 MB
- Sharing rejects missing users, sharing with yourself, and unknown users
- Only the owner can share a document

## What works and what is incomplete

**Working end to end:** create, rename, edit with formatting, autosave, refresh persistence, upload, owner-only sharing, shared-user editing, blocked access for others, deployment.

**Known limitations (deliberate scope cuts):**

- **Mocked login.** The app trusts a user ID header sent by the browser, so anyone can pick any user. This is fine for a demo of the sharing logic, but it is not real authentication.
- **No real-time collaboration.** If two people edit the same document at once, the last save wins.
- **No unsharing, deleting documents, or view-only permissions.** Anyone a document is shared with can edit it.
- **No `.docx` import.**

**What I would build next with another 2 to 4 hours:**

1. Real authentication (Supabase Auth) in place of the user switcher, with access rules enforced in the database (row-level security)
2. View-only vs edit permissions and the ability to remove access
3. `.docx` import and export to PDF or Markdown
4. Version history and conflict handling for simultaneous edits

## Further documentation

- `ARCHITECTURE.md`: what I prioritized and why
- `AI_WORKFLOW.md`: how I used AI tools, what I changed or rejected, and how I verified the results
