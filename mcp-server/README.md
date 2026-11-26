# MCP server: edit the site with Claude

This lets Claude Code or Claude Desktop read and change the website for you. You can say things like "add my new teaching assistant job to the site" or "change the hero status line", and Claude does it through the site's API.

It's a small program (`server.py`) that runs on your own computer. Claude starts it when it needs it. It logs in with an **API key**, not your password. The key can edit content and settings, but it can't create or revoke keys, and you can revoke it at any time from the admin page.

## What Claude can do with it

| Tool | What it does |
| --- | --- |
| `get_site_content` | Read everything: settings, about, and every list including hidden items |
| `list_items` | One list (projects, experience, education, skills, interests) with ids |
| `add_project`, `add_experience`, `add_education`, `add_skill_group`, `add_interest` | Add an item at the end of a list |
| `update_item` | Change some fields of one item |
| `reorder_items` | Put a list in a new order |
| `update_about` | Change name, title, bio, photo or links |
| `update_settings` | Change hero text, colors, fonts, sections, menu or labels |
| `upload_media` | Upload a local image or video and get its URL |
| `delete_item` | Delete an item (Claude is told to ask you first) |

Changes go live on the site right away.

## Setup

You need [uv](https://docs.astral.sh/uv/) installed (`uv --version` to check). It installs the two Python packages the server needs the first time it runs. There is nothing else to install.

### 1. Create an API key

Log in to the site, open **Admin → API keys**, give the key a name (for example "Claude Code") and press **Create key**. Copy the key now; it's shown only once. It starts with `pwk_`.

Make one key per place you use it (one for Claude Code, one for Claude Desktop), so you can revoke them separately.

### 2a. Claude Code

Run this once in a terminal, with your backend address and key filled in:

```bash
claude mcp add personal-website --scope user \
  -e SITE_API_URL=https://YOUR-BACKEND.onrender.com \
  -e SITE_API_KEY=pwk_YOUR_KEY \
  -- uv run --script /home/docpro/Developer/projects/Personal-Website/mcp-server/server.py
```

`--scope user` makes it available in every project, not just this folder. The name (`personal-website`) has to come before the `-e` options.

Check it with `claude mcp list`, or type `/mcp` inside Claude Code. Remove it again with `claude mcp remove personal-website --scope user`.

### 2b. Claude Desktop

Open the config file `~/.config/Claude/claude_desktop_config.json` (on a Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`). Keep what is already in it and add an `mcpServers` entry next to it:

```json
{
  "mcpServers": {
    "personal-website": {
      "command": "/home/docpro/.local/bin/uv",
      "args": ["run", "--script", "/home/docpro/Developer/projects/Personal-Website/mcp-server/server.py"],
      "env": {
        "SITE_API_URL": "https://YOUR-BACKEND.onrender.com",
        "SITE_API_KEY": "pwk_YOUR_KEY"
      }
    }
  }
}
```

Use the full path to `uv` (find it with `which uv`), because desktop apps often don't see the same `PATH` as your terminal. Then quit Claude Desktop completely and open it again.

### 3. Try it

Ask Claude: "What's on my website right now?" It should call `get_site_content`. The first call can take up to a minute if the Render server is asleep.

## Trying it against your local backend

Start the backend (`poetry run uvicorn app.main:app --reload` in `backend/`), log in at http://localhost:5173/login, create a key, and use `http://localhost:8000` as `SITE_API_URL`.

## Keeping it safe

- The key sits in plain text in Claude's config (`~/.claude.json` for Claude Code, the file above for Claude Desktop). Treat those files like a password file, and never commit a key to git.
- If a key might have leaked, revoke it in **Admin → API keys**. It stops working immediately.
- Claude asks for permission before it uses a tool, unless you've allowed it to always run. Keep that for `delete_item` and `update_settings`.
