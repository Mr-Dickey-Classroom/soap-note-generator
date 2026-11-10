# Start here: building the SOAP Note Generator app with Claude Code

This kit has everything Claude Code needs to turn the current one-file tool into a free, installable, offline-capable app that any athletic trainer can use, hosted on GitHub Pages.

## What's in the kit

| File | What it's for |
|---|---|
| `START-HERE.md` | This guide (for you) |
| `CLAUDE.md` | Standing instructions Claude Code reads automatically at the start of every session |
| `docs/SPEC.md` | The full product spec: features, settings, outputs, offline, privacy, acceptance checklist |
| `docs/BUILD_PLAN.md` | Eight copy-paste prompts, one per build phase |
| `reference/soap-note-generator-v8.html` | Today's working tool, with STCS/personal names removed. Claude ports the clinical engine from it. |
| `tests/fixtures/` | Sample outputs from today's tool (shoulder initial eval, knee re-eval) that the new app must reproduce |

## Before you start

- A **GitHub account** (free).
- A Claude plan that includes **Claude Code cloud sessions** (Pro, Max, Team, or Enterprise). This guide uses Claude Code in the browser at claude.ai/code, so nothing needs to be installed on your laptop.
- **GitHub Pages is free for public repositories.** Hosting from a private repository needs a paid GitHub plan. The kit is safe to make public: it has no student or personal data.

## Step 1: Create the repository

1. Go to **github.com/new**.
2. Name it, e.g. `soap-note-generator`.
3. Choose **Public**, and check **Add a README file**.
4. Click **Create repository**.

## Step 2: Upload the kit

1. Unzip `soap-app-starter-kit.zip` on your computer.
2. In the new repository, click **Add file → Upload files**.
3. Open the unzipped folder, select **everything inside it** (`CLAUDE.md`, `START-HERE.md`, and the `docs`, `reference`, and `tests` folders), and drag it all onto the GitHub page. Chrome and Edge keep the folder structure.
4. Click **Commit changes**.
5. Check that the repository's top level shows `CLAUDE.md`, `docs/`, `reference/`, and `tests/` (not one extra folder wrapping them).

## Step 3: Connect Claude Code to GitHub (one time)

1. Go to **claude.ai/code** and sign in.
2. When prompted, **Sign in with GitHub** and approve the authorization.
3. Leave the **Default** cloud environment as it is. Its "Trusted" network access lets Claude download the PDF library and test tools from npm.

*On a Team or Enterprise Claude plan:* if you see "GitHub access is required for Claude Code cloud sessions" instead of a sign-in button, an owner of your Claude organization has to turn on the GitHub connector first.

## Step 4: Run the phases

For each phase in `docs/BUILD_PLAN.md`:

1. At claude.ai/code, choose your repository in the selector under the message box (branch: `main`).
2. Choose the permission mode: **Plan** for Phase 0, then **Accept edits** (or **Auto**) for Phases 1–7.
3. Paste that phase's prompt and send it.
4. When Claude stops, read its summary, open the diff, and select **Create PR**.
5. On GitHub, open the pull request → **Merge pull request** → **Confirm merge**.
6. Start a **new session** for the next phase, so each one begins from the merged `main`.

Expect each phase to take one session, sometimes with a follow-up message or two. If a phase runs long, tell Claude to finish what it's doing, push, and summarize what's left. Then run the leftovers as their own session.

**Your checkpoints as the clinician:**
- After Phase 1: open `docs/evidence-table.csv` and `docs/QUESTIONS.md`. The likelihood ratios were drafted with AI help and need your review before anyone else relies on them.
- After Phase 2: fill in a real (made-up) case and check that the differential behaves the way today's tool does.
- After Phase 5: open the PDFs in `docs/samples/` and check the layout.

## Step 5: Turn on GitHub Pages (once, after Phase 1 is merged)

1. Repository → **Settings → Pages**.
2. **Source:** Deploy from a branch. **Branch:** `main`, folder **/ (root)**. Click **Save**.
3. Within a couple of minutes the site is live at `https://YOUR-USERNAME.github.io/soap-note-generator/`. It updates automatically every time you merge a PR.

## Step 6: Use it and share it

- **Install it:** open the site in Chrome or Edge on your laptop and click the install icon in the address bar. On iPad/iPhone, open it in Safari → Share → **Add to Home Screen**. After one visit it works offline.
- **Make it yours:** open **Settings** to add your logo, colors, organization name, your name and credentials, your physician's name, your referral and therex lists, and your EMR's character limit. Then use **Export settings** to back them up or move them to another device.
- **Share it:** send other ATs the link. Each person's settings stay on their own device. Nobody sees anyone else's notes, because notes are never stored or sent anywhere.

## Things to decide (Claude will ask, or note them in docs/QUESTIONS.md)

- **License:** the plan uses MIT (free to use and modify). Change it in Phase 1 if you want something different.
- **Disclaimer wording:** the About screen and PDF footer say it's decision support and doesn't replace clinical judgment. Have your directing physician or school counsel look it over if you plan to promote it widely. I'm not a lawyer.
- **Healthy Roster limit:** 5,000 characters is the default. It was inferred from the rejected 5,484-character paste, not confirmed with Healthy Roster. Each user can change it in Settings.
