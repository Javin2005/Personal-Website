# /// script
# requires-python = ">=3.10"
# dependencies = ["mcp>=1.30,<2", "httpx>=0.27,<1"]
# ///
"""MCP server that lets Claude (Claude Code or Claude Desktop) read and edit
the personal website through its API.

It runs on your own computer. Claude starts it when needed and talks to it
over stdin/stdout. It needs two environment variables:

    SITE_API_URL   the backend, e.g. https://your-backend.onrender.com
    SITE_API_KEY   an API key from Admin -> API keys (starts with pwk_)

Run by hand to check it starts (it then waits for Claude; stop with Ctrl+C):

    SITE_API_URL=http://localhost:8000 SITE_API_KEY=pwk_... uv run --script server.py

See the README section "Editing the site with Claude" for setup.
"""
import os
from pathlib import Path
from typing import Any, Literal, Optional

import httpx
from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations

API_URL = os.environ.get("SITE_API_URL", "").rstrip("/")
API_KEY = os.environ.get("SITE_API_KEY", "")

Collection = Literal["projects", "experience", "education", "skills", "interests"]

mcp = FastMCP(
    "personal-website",
    instructions=(
        "Tools for reading and editing Christian's personal website. Start with "
        "get_site_content to see what is there. Write in his voice: plain, direct, "
        "first person, no marketing words. Changes go live immediately, so show "
        "the user what you are about to add or change and ask before deleting "
        "anything or changing colors, fonts or layout."
    ),
)

READ = ToolAnnotations(readOnlyHint=True)
WRITE = ToolAnnotations(readOnlyHint=False, destructiveHint=False)
DELETE = ToolAnnotations(readOnlyHint=False, destructiveHint=True)


# ---------------------------------------------------------------- HTTP helpers

def _client() -> httpx.Client:
    if not API_URL or not API_KEY:
        raise RuntimeError(
            "SITE_API_URL and SITE_API_KEY must be set in the MCP server's environment."
        )
    # Render's free plan sleeps; the first request can take up to a minute.
    return httpx.Client(
        base_url=API_URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        timeout=httpx.Timeout(90.0, connect=90.0),
    )


def _error_text(res: httpx.Response) -> str:
    try:
        detail = res.json().get("detail")
    except Exception:
        detail = None
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list):
        return "; ".join(
            f"{'.'.join(str(p) for p in d.get('loc', [])[1:])}: {d.get('msg')}" for d in detail
        )
    return f"HTTP {res.status_code}: {res.text[:300]}"


def _request(method: str, path: str, **kwargs) -> Any:
    with _client() as client:
        res = client.request(method, path, **kwargs)
    if res.status_code == 401:
        raise RuntimeError("The API key was rejected. It may have been revoked; create a new one in Admin -> API keys.")
    if res.status_code >= 400:
        raise RuntimeError(f"The site refused the request: {_error_text(res)}")
    return res.json()


def _find(collection: str, item_id: int) -> dict:
    for item in _request("GET", f"/api/admin/{collection}"):
        if item["id"] == item_id:
            return item
    raise RuntimeError(f"No item with id {item_id} in {collection}. Use list_items to see the ids.")


def _deep_merge(base: dict, changes: dict) -> dict:
    merged = dict(base)
    for key, value in changes.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


# ---------------------------------------------------------------- reading

@mcp.tool(annotations=READ)
def get_site_content() -> dict:
    """Everything on the site: settings (colors, fonts, hero text, sections,
    menu, labels), the about section, and every item of every list including
    hidden ones, with their ids."""
    content = {
        "settings": _request("GET", "/api/settings"),
        "about": _request("GET", "/api/about"),
    }
    for collection in ("projects", "experience", "education", "skills", "interests"):
        content[collection] = _request("GET", f"/api/admin/{collection}")
    return content


@mcp.tool(annotations=READ)
def list_items(collection: Collection) -> dict:
    """All items in one list, in the order they appear on the site, including
    hidden ones (visible=false)."""
    return {"collection": collection, "items": _request("GET", f"/api/admin/{collection}")}


# ---------------------------------------------------------------- adding

@mcp.tool(annotations=WRITE)
def add_project(
    title: str,
    description: str,
    tech_stack: Optional[list[str]] = None,
    github_url: Optional[str] = None,
    live_url: Optional[str] = None,
    media_url: Optional[str] = None,
    category: str = "",
    period: str = "",
    difficulty: int = 3,
    featured: bool = False,
    visible: bool = True,
) -> dict:
    """Add a project at the end of the list.

    featured=True also shows it on the homepage. period is free text like
    "2026" or "2025 – 2026". media_url is an image or .mp4/.webm video URL
    (use upload_media for a local file). difficulty is 1-5 and only shown
    to the admin.
    """
    return _request("POST", "/api/projects", json={
        "title": title, "description": description, "tech_stack": tech_stack or [],
        "github_url": github_url, "live_url": live_url, "media_url": media_url,
        "category": category, "period": period, "difficulty": difficulty,
        "featured": featured, "visible": visible,
    })


@mcp.tool(annotations=WRITE)
def add_experience(
    role: str,
    organisation: str,
    period: str = "",
    location: str = "",
    summary: str = "",
    tags: Optional[list[str]] = None,
    visible: bool = True,
) -> dict:
    """Add a job, role or volunteering entry at the end of the experience
    list. The site shows the list top to bottom, newest first by convention,
    so call reorder_items afterwards if it should go higher up."""
    return _request("POST", "/api/experience", json={
        "role": role, "organisation": organisation, "period": period,
        "location": location, "summary": summary, "tags": tags or [], "visible": visible,
    })


@mcp.tool(annotations=WRITE)
def add_education(
    school: str,
    programme: str,
    period: str = "",
    location: str = "",
    notes: str = "",
    courses: Optional[list[str]] = None,
    visible: bool = True,
) -> dict:
    """Add a school or programme. To add courses to an existing entry, use
    update_item with the full new courses list instead."""
    return _request("POST", "/api/education", json={
        "school": school, "programme": programme, "period": period,
        "location": location, "notes": notes, "courses": courses or [], "visible": visible,
    })


@mcp.tool(annotations=WRITE)
def add_skill_group(label: str, items: list[str], visible: bool = True) -> dict:
    """Add a group of skills, e.g. label="Learning", items=["Rust", "CUDA"].
    To add one skill to an existing group, use update_item on that group."""
    return _request("POST", "/api/skills", json={"label": label, "items": items, "visible": visible})


@mcp.tool(annotations=WRITE)
def add_interest(category: str, title: str, creator: str = "", note: str = "", visible: bool = True) -> dict:
    """Add a book, film, album or similar. Items with the same category are
    grouped together. The interests section itself is hidden until it is
    turned on in the settings (sections list, id "interests")."""
    return _request("POST", "/api/interests", json={
        "category": category, "title": title, "creator": creator, "note": note, "visible": visible,
    })


# ---------------------------------------------------------------- changing

@mcp.tool(annotations=WRITE)
def update_item(collection: Collection, item_id: int, changes: dict) -> dict:
    """Change some fields of one item, e.g. changes={"summary": "...", "tags": ["C++"]}.
    Fields not mentioned stay as they are. Lists (tags, courses, items,
    tech_stack) are replaced as a whole, so send the full new list."""
    item = _find(collection, item_id)
    merged = {**item, **changes}
    return _request("PUT", f"/api/{collection}/{item_id}", json=merged)


@mcp.tool(annotations=WRITE)
def reorder_items(collection: Collection, item_ids: list[int]) -> dict:
    """Set the order of a list. item_ids must contain every id in the list,
    in the new order (first = shown first)."""
    current = {item["id"] for item in _request("GET", f"/api/admin/{collection}")}
    if set(item_ids) != current or len(item_ids) != len(current):
        raise RuntimeError(f"item_ids must contain each of these ids exactly once: {sorted(current)}")
    return _request("PUT", f"/api/{collection}/order", json=item_ids)


@mcp.tool(annotations=WRITE)
def update_about(
    name: Optional[str] = None,
    title: Optional[str] = None,
    bio: Optional[str] = None,
    profile_pic: Optional[str] = None,
    socials: Optional[list[dict]] = None,
) -> dict:
    """Change the about section. Only the fields you pass change. bio uses a
    blank line between paragraphs. socials is the full list of links, each
    {"platform": "GitHub", "url": "https://..."}."""
    about = _request("GET", "/api/about")
    for key, value in {"name": name, "title": title, "bio": bio,
                       "profile_pic": profile_pic, "socials": socials}.items():
        if value is not None:
            about[key] = value
    about.pop("id", None)
    return _request("PUT", "/api/about", json=about)


@mcp.tool(annotations=WRITE)
def update_settings(changes: dict) -> dict:
    """Change site settings. `changes` is merged into the current settings,
    so only send what changes, e.g.
      {"hero": {"status": "Starting an exchange semester in the US this spring."}}
      {"theme": {"accent": "#e8955a"}}            colors must be #rrggbb
      {"labels": {"formSend": "Send"}}
      {"sections": [...]}                          the full list (order + visibility)
    Read get_site_content first to see the current structure and values.
    Lists such as sections, nav, hero.footer and hero.readout are replaced
    whole. Fonts must be one of the fonts the admin page offers."""
    current = _request("GET", "/api/settings")
    return _request("PUT", "/api/settings", json=_deep_merge(current, changes))


@mcp.tool(annotations=WRITE)
def upload_media(file_path: str) -> dict:
    """Upload a local image (max 10 MB) or .mp4/.webm video (max 40 MB) and get
    back its URL, to use as a project's media_url or the profile picture."""
    path = Path(file_path).expanduser()
    if not path.is_file():
        raise RuntimeError(f"No file at {path}")
    types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
             ".gif": "image/gif", ".avif": "image/avif", ".mp4": "video/mp4", ".webm": "video/webm"}
    content_type = types.get(path.suffix.lower())
    if not content_type:
        raise RuntimeError(f"Unsupported file type {path.suffix}; use one of {', '.join(types)}")
    with path.open("rb") as f:
        return _request("POST", "/api/media", files={"file": (path.name, f, content_type)})


# ---------------------------------------------------------------- deleting

@mcp.tool(annotations=DELETE)
def delete_item(collection: Collection, item_id: int) -> dict:
    """Permanently delete one item. Ask the user first; hiding it with
    update_item(..., {"visible": false}) is usually the safer choice."""
    return _request("DELETE", f"/api/{collection}/{item_id}")


if __name__ == "__main__":
    mcp.run()  # stdio
