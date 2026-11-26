"""The small "latest commit / now playing" line on the site.

Your GitHub and Spotify tokens stay here on the server; the browser only
gets the harmless result.
"""
import os
import time
from base64 import b64encode

import httpx
from fastapi import APIRouter

router = APIRouter()

# The status line asks for GitHub/Spotify status every 30 seconds per visitor.
# Without a cache, 10 visitors = 40+ GitHub API calls per minute, which hits
# GitHub's rate limit fast. We remember the last answer for a short while instead.
_status_cache: dict = {}


def cached(key: str, max_age: float):
    hit = _status_cache.get(key)
    if hit and time.monotonic() - hit[0] < max_age:
        return hit[1]
    return None


def remember(key: str, value: dict) -> dict:
    _status_cache[key] = (time.monotonic(), value)
    return value


@router.get("/api/status/github")
async def get_github_status():
    hit = cached("github", 300)
    if hit is not None:
        return hit
    return remember("github", await _fetch_github_status())


async def _fetch_github_status():
    username = "Javin2005"
    token = os.getenv("GITHUB_TOKEN")
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "javincarlson-portfolio",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1. Check recent Events API
            events_res = await client.get(
                f"https://api.github.com/users/{username}/events",
                headers=headers,
            )
            if events_res.status_code == 200:
                events = events_res.json()
                push_event = (
                    next((e for e in events if e.get("type") == "PushEvent"), None)
                    if isinstance(events, list)
                    else None
                )
                if push_event:
                    repo_full_name = push_event.get("repo", {}).get("name", "")
                    repo_name = repo_full_name.split("/")[-1] or "unknown"
                    payload = push_event.get("payload", {})
                    head_sha = payload.get("head")

                    if repo_full_name and head_sha:
                        commit_res = await client.get(
                            f"https://api.github.com/repos/{repo_full_name}/commits/{head_sha}",
                            headers=headers,
                        )
                        if commit_res.status_code == 200:
                            msg = commit_res.json().get("commit", {}).get("message", "")
                            if msg:
                                return {
                                    "repo": repo_name,
                                    "message": msg.splitlines()[0],
                                    "active": True,
                                }

                    ref = payload.get("ref", "main").split("/")[-1]
                    return {
                        "repo": repo_name,
                        "message": f"Pushed to {ref}",
                        "active": True,
                    }
            else:
                print(f"GitHub Events API {events_res.status_code}: {events_res.text}")

            # 2. Fallback if no push events in the last 30 days
            repos_res = await client.get(
                f"https://api.github.com/users/{username}/repos?sort=pushed&per_page=1",
                headers=headers,
            )
            if repos_res.status_code == 200:
                repos = repos_res.json()
                if isinstance(repos, list) and repos:
                    repo_full_name = repos[0]["full_name"]
                    repo_name = repos[0]["name"]
                    commits_res = await client.get(
                        f"https://api.github.com/repos/{repo_full_name}/commits?per_page=1",
                        headers=headers,
                    )
                    if commits_res.status_code == 200:
                        commits = commits_res.json()
                        if isinstance(commits, list) and commits:
                            msg = commits[0].get("commit", {}).get("message", "Updated files")
                            return {
                                "repo": repo_name,
                                "message": msg.splitlines()[0],
                                "active": True,
                            }
        except Exception as e:
            print(f"GitHub API Error: {e}")

    return {"active": False}


@router.get("/api/status/spotify")
async def get_spotify_status():
    hit = cached("spotify", 25)
    if hit is not None:
        return hit
    return remember("spotify", await _fetch_spotify_status())


async def _fetch_spotify_status():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    refresh_token = os.getenv("SPOTIFY_REFRESH_TOKEN")


    if not all([client_id, client_secret, refresh_token]):
        return {"active": False}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            auth_str = f"{client_id}:{client_secret}"
            b64_auth = b64encode(auth_str.encode()).decode()

            token_url = "https://accounts.spotify.com/api/token"
            token_data = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
            token_headers = {
                "Authorization": f"Basic {b64_auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            }

            token_res = await client.post(token_url, data=token_data, 
                                          headers=token_headers)
            access_token = token_res.json().get("access_token")
            if not access_token:
                print(f"Spotify token refresh failed: {token_res.status_code}")
                return {"active": False}

            playback_url = "https://api.spotify.com/v1/me/player/currently-playing"
            headers = {"Authorization": f"Bearer {access_token}"}

            resp = await client.get(playback_url, headers=headers)

            if resp.status_code == 204:
                return {"active": False, "message": "Nothing playing"}
            
            if resp.status_code != 200:
                return {"active": False}

            data = resp.json()
            # "item" is null for ads and some podcasts
            if data.get("is_playing") and data.get("item"):
                return {
                    "active": True,
                    "track": data["item"] ["name"],
                    "artist": data["item"] ["artists"] [0] ["name"],
                    "link": data["item"] ["external_urls"] ["spotify"]
                }
        except Exception as e:
            print(f"Spotify API Error: {e}")
    return {"active": False}
