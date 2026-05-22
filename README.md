# Veepo Content Studio

Private daily social media content generator + admin dashboard for Parker @ Veepo.ca.

**Lovable project**: https://lovable.dev/projects/a8e59680-e4fc-4735-a797-36af2f7e2875

## System overview

```
Python backend (generator.py)
  → runs daily at 8 AM MST via Windows Task Scheduler
  → generates 3 posts using Claude API (claude-sonnet-4-6)
  → saves to data/posts.json
  → emails to parker@veepo.ca via Resend

Lovable frontend (src/)
  → private admin dashboard (single user: Parker)
  → view today's 3 post options (LinkedIn + X)
  → select the winner → download as .txt
  → full history of all past generations
  → learning panel showing which pillars perform best
```

## Python backend setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Add ANTHROPIC_API_KEY and RESEND_API_KEY to .env
python generator.py
```

## Windows Task Scheduler (daily 8 AM MST)

Run PowerShell as Administrator: `.\setup-scheduler.ps1`

## Key files

| File | Purpose |
|---|---|
| `generator.py` | Main Python script — generates 3 posts, emails Parker |
| `brands/veepo.json` | Brand config, full persona, campaign pillars, copy angles |
| `data/posts.json` | Post history database (every generated run) |
| `LOVABLE-PROMPT.md` | Complete prompt to give Lovable for the admin app build |
| `CONTENT-VAULT.md` | 10 ready-to-post captions + nano influencer strategy |
| `PERSONA-PROMPT.md` | Portfolio-to-Passport Photographer buyer persona |
| `requirements.txt` | Python dependencies |
| `run.bat` | Called by Windows Task Scheduler |
| `setup-scheduler.ps1` | Registers the daily 8 AM Task Scheduler job |

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a8e59680-e4fc-4735-a797-36af2f7e2875) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a8e59680-e4fc-4735-a797-36af2f7e2875) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
