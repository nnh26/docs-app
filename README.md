# Submission

**Candidate:** Nowshin Hoque

## Links

- **Live app:** https://docs-app-bice.vercel.app/
- **Source code (GitHub):** https://github.com/nnh26/docs-app
- **Walkthrough video:** https://youtu.be/sY-B86tOdkM

## What is included in this folder

| File or folder | What it is |
|---|---|
| `app/` | Next.js pages, components, and API routes |
| `lib/` | Access rule, database client, and API helper |
| `supabase/schema.sql` | Database schema and seeded users |
| `README.md` | Setup, run instructions, test accounts, scope notes |
| `ARCHITECTURE.md` | What I prioritized, what I cut, and why |
| `AI_WORKFLOW.md` | How I used AI tools and verified the results |
| `SUBMISSION.md` | This file |
| `walkthrough-video.txt` | The video URL |
| `package.json` | Dependencies and scripts |

## Accounts for reviewing sharing

No passwords. Use the **Signed in as** dropdown at the top right to switch between three seeded users: **Alice**, **Bob**, and **Carol**.

Suggested test: as Bob, create a document and share it with Alice. Switch to Alice and open it from "Shared with me". Switch to Carol and open the same URL to see access denied.

## What works end to end

- Create, rename, edit, save, and reopen documents
- Bold, italic, underline, headings, bulleted and numbered lists
- Autosave and persistence across refreshes
- Upload of `.txt` and `.md` files into new editable documents (limit stated in the UI)
- Owner-only sharing, shared users can open and edit, and an Owned vs Shared distinction in the list
- Owner-only delete with a confirmation prompt
- Validation and clear error messages on every route
- Automated test for the access rule (`npm test`)
- Live deployment on Vercel

## What is incomplete or intentionally cut

- Mocked login (user switcher) instead of real authentication
- No real-time collaboration (last save wins)
- No unsharing or view-only permissions
- No `.docx` upload

## What I would build next with 2 to 4 more hours

1. Supabase Auth with row-level security policies
2. Edit vs view-only permissions and removing access
3. Export to PDF or Markdown, and `.docx` import
4. Version history and better handling of simultaneous edits

## Local setup

See `README.md` for the steps.
