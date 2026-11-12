# AI workflow note

## Tools used

- **Claude (chat)**: planning the scope and build order, drafting code for each file, debugging errors I pasted in, and drafting the written deliverables.
- **No other AI tools.** I wrote and ran everything in VS Code and the terminal, and I pasted code into my files myself.

## Where AI materially sped me up

- **Scoping.** Claude turned the open-ended prompt into a build order (database, backend routes, document list, editor, sharing, upload, tests, deploy) and a time plan, so I could cut features early instead of at the end.
- **Boilerplate.** The Tiptap editor setup, the API routes with validation, the share panel, and the upload converter were drafted by Claude, which saved the most time on the editor toolbar and the Supabase queries.
- **Debugging.** When I pasted terminal output and browser errors, Claude located the cause quickly instead of me searching through docs.
- **Writing.** The README, architecture note, and this note started as drafts that I then edited.

## What I changed or rejected

- **Rejected the `@supabase/ssr` and publishable-key setup** that Supabase's "Connect" page suggested. The app only talks to the database from server routes, so I used the server-side secret key instead, and I kept the secret out of `NEXT_PUBLIC_` variables so it never reaches the browser.
- **Skipped the underline extension.** The first plan installed it separately, but I checked and Tiptap v3's StarterKit already includes underline, so adding it would have registered it twice.
- **Chose to enable Row Level Security** when Supabase warned about it, so the public key cannot read my tables.
- **Moved the access rule into its own file** (`lib/permissions.ts`). The first version imported the Supabase client, which would crash a unit test without environment variables, so I split the pure rule from the database lookups.
- **Cut `.docx` upload** to protect the time budget. `.txt` and `.md` meet the requirement.

## What AI got wrong, and how I fixed it

- **Ambiguous database relationship.** The document list and single-document routes returned 500 because Supabase could not tell which link between `documents` and `users` to follow (there are two paths, through `owner_id` and through `shares`). I fixed it by naming the foreign key explicitly (`users!owner_id`).
- **Next.js Suspense error.** The editor page crashed because this Next.js version needs `useParams()` inside a Suspense boundary. I wrapped the page content in `Suspense`.
- **Unreadable dropdown in dark mode.** The user switcher's options had pale text on a white list. I forced readable colors.
- **Stale error message.** After one failed autosave the error stayed on screen even after later saves worked, so I clear it on a successful save.
- **Invalid `package.json`.** I merged the new test script into the file incorrectly (a duplicate `scripts` block and a missing comma) and fixed it by hand.

## How I verified correctness, UX, and reliability

- **Automated test.** Vitest tests for the access rule (owner allowed, shared user allowed, stranger blocked, nothing leaks when nothing is shared). `npm test` passes, 4 of 4.
- **Manual end-to-end testing.** I created a document, formatted it, waited for "Saved", and refreshed to confirm persistence. I shared it from Bob to Alice, checked that it appeared under "Shared with me" with a "Shared by Bob" badge, and confirmed Carol was blocked when opening the URL directly.
- **Upload.** I uploaded a Markdown file and checked that the headings, both list types, bold, and italic rendered correctly in the editor, and that the picker only offers `.txt` and `.md`.
- **Visual check.** I viewed the app in both dark and light mode.
- **Production build and live test.** I ran `npm run build` before deploying and tested the live Vercel deployment [edit: say which flows you tested there].
- **Judgment on AI output.** I did not paste in code I did not understand. When an error appeared, I read the terminal output and checked it against the file before applying a fix.