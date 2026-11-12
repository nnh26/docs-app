# AI log

## Tools used
- Claude (planning, code help, debugging)

## Log
- Used Claude to plan the stack (Next.js, Supabase, Tiptap, Vercel) and the build order
- vitest install failed on a @types/node version conflict, fixed by upgrading @types/node to 22
- Claude drafted the schema, and I verified the tables in Supabase
- Claude suggested the underline extension, but the installed Tiptap version (3.x) already includes it, so I skipped it
- Claude's Supabase setup page suggested a publishable key and @supabase/ssr. I used the server-side secret key instead because the app only talks to the database from API routes
- I chose "Run and enable RLS" in Supabase so the public key can't read the tables
- Claude wrote lib/access.ts. I kept the access rule as a plain function separate from the database calls so it can be unit tested
- Claude wrote the documents list/create route. I checked that the dev server shows no errors
- Claude wrote the single-document route. Verified the 404, 403, and 400 cases later when testing in the UI
- Claude wrote the share and users routes. I made sharing owner-only and will test the 403 when switching users in the UI
- Claude wrote the user switcher (mocked login). Chose localStorage plus a header instead of real auth because the assignment allows mocked users
- List route failed with an ambiguous relationship between documents and users. Fixed by naming the foreign key (users!owner_id)
- - The Alice/Bob/Carol dropdown was hard to read in dark mode (pale text on a white list). Claude suggested forcing readable colors on the select (bg-white, text-black). I checked it in the browser
- Editor loaded after fixing the owner:users!owner_id select. Tested autosave and refresh persistence by hand
- Hand testing sharing, no access: everything checks out
- Claude wrote the access unit tests. The first plan imported the Supabase client, which would crash without env vars, so I moved the pure access rule into lib/permissions.ts and tested that