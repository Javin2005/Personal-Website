import copy

import pytest

from app import main as main_module
from app.database import run_migrations

# One valid item per collection, used by the generic tests below.
SAMPLES = {
    "projects": {"title": "Test project", "description": "d", "tech_stack": ["C++", " ", "Python "]},
    "experience": {"role": "Tester", "organisation": "Org", "tags": ["a"]},
    "education": {"school": "LTH", "programme": "D", "courses": ["Algorithms"]},
    "skills": {"label": "Learning", "items": ["Rust"]},
    "interests": {"category": "Books", "title": "Dune", "creator": "Frank Herbert"},
}
COLLECTIONS = list(SAMPLES)


# ---------------------------------------------------------------- public reads

def test_site_has_everything(client):
    site = client.get("/api/site").json()
    assert set(site) == {"settings", "about", "skills", "interests", "experience", "education", "projects"}
    settings = site["settings"]
    assert settings["theme"]["accent"].startswith("#")
    assert settings["labels"]["scrollDown"] == "Scroll down"
    assert settings["siteTitle"]


def test_migrations_can_run_again(client):
    run_migrations()  # already at head: must be a no-op, not an error


# ---------------------------------------------------------------- the lock

@pytest.mark.parametrize("collection", COLLECTIONS)
def test_writes_need_login(client, collection):
    assert client.post(f"/api/{collection}", json=SAMPLES[collection]).status_code == 401
    assert client.put(f"/api/{collection}/1", json=SAMPLES[collection]).status_code == 401
    assert client.delete(f"/api/{collection}/1").status_code == 401
    assert client.put(f"/api/{collection}/order", json=[1]).status_code == 401
    assert client.get(f"/api/admin/{collection}").status_code == 401


def test_other_writes_need_login(client):
    assert client.put("/api/settings", json={}).status_code == 401
    assert client.put("/api/about", json={}).status_code == 401
    assert client.post("/api/media", files={"file": ("a.png", b"x", "image/png")}).status_code == 401
    assert client.get("/api/admin/api-keys").status_code == 401


def test_forged_token_rejected(client):
    bad = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.forged"}
    assert client.put("/api/settings", json={}, headers=bad).status_code == 401
    assert client.put("/api/settings", json={}, headers={"Authorization": "Bearer pwk_madeup"}).status_code == 401


def test_login_failures_look_the_same(client):
    wrong_password = client.post("/api/token", data={"username": "admin", "password": "nope"})
    unknown_user = client.post("/api/token", data={"username": "nobody", "password": "nope"})
    assert wrong_password.status_code == unknown_user.status_code == 400
    assert wrong_password.json() == unknown_user.json()


def test_login_is_rate_limited(client):
    codes = [client.post("/api/token", data={"username": "x", "password": "y"}).status_code for _ in range(6)]
    assert codes[:5] == [400] * 5 and codes[5] == 429


# ---------------------------------------------------------------- collections

@pytest.mark.parametrize("collection", COLLECTIONS)
def test_collection_lifecycle(client, auth, collection):
    created = client.post(f"/api/{collection}", json=SAMPLES[collection], headers=auth)
    assert created.status_code == 200, created.text
    item = created.json()
    assert item["visible"] is True

    # hidden items disappear from the public list but stay in the admin list
    hidden = client.put(f"/api/{collection}/{item['id']}", json={**item, "visible": False}, headers=auth)
    assert hidden.status_code == 200, hidden.text
    assert item["id"] not in [i["id"] for i in client.get(f"/api/{collection}").json()]
    assert item["id"] in [i["id"] for i in client.get(f"/api/admin/{collection}", headers=auth).json()]

    # reorder: reverse the list
    ids = [i["id"] for i in client.get(f"/api/admin/{collection}", headers=auth).json()][::-1]
    assert client.put(f"/api/{collection}/order", json=ids, headers=auth).status_code == 200
    assert [i["id"] for i in client.get(f"/api/admin/{collection}", headers=auth).json()] == ids

    assert client.delete(f"/api/{collection}/{item['id']}", headers=auth).status_code == 200
    assert client.delete(f"/api/{collection}/{item['id']}", headers=auth).status_code == 404


def test_lists_are_cleaned(client, auth):
    item = client.post("/api/projects", json=SAMPLES["projects"], headers=auth).json()
    assert item["tech_stack"] == ["C++", "Python"]


@pytest.mark.parametrize("bad", [
    {"title": ""},
    {"title": "x", "github_url": "javascript:alert(1)"},
    {"title": "x", "media_url": "//evil.example/x.mp4"},
    {"title": "x", "difficulty": 9},
])
def test_project_validation(client, auth, bad):
    assert client.post("/api/projects", json=bad, headers=auth).status_code == 422


def test_update_missing_item(client, auth):
    assert client.put("/api/experience/99999", json=SAMPLES["experience"], headers=auth).status_code == 404


# ---------------------------------------------------------------- settings

def current_settings(client):
    return client.get("/api/settings").json()


def test_settings_save_and_merge(client, auth):
    settings = current_settings(client)
    settings["theme"]["accent"] = "#123456"
    settings["labels"]["formSend"] = "Send it"
    del settings["labels"]["scrollDown"]  # missing labels fall back to defaults
    assert client.put("/api/settings", json=settings, headers=auth).status_code == 200
    again = current_settings(client)
    assert again["theme"]["accent"] == "#123456"
    assert again["labels"]["formSend"] == "Send it"
    assert again["labels"]["scrollDown"] == "Scroll down"


@pytest.mark.parametrize("path, value", [
    (("theme", "accent"), "red;} body{display:none"),
    (("theme", "fontDisplay"), "Comic Sans'; }"),
    (("video", "src"), "javascript:alert(1)"),
    (("video", "opacity"), 3),
    (("hero", "firstLine"), ""),
])
def test_settings_validation(client, auth, path, value):
    settings = current_settings(client)
    settings[path[0]][path[1]] = value
    assert client.put("/api/settings", json=settings, headers=auth).status_code == 422


def test_settings_bad_nav_label_and_sections(client, auth):
    settings = current_settings(client)
    bad_nav = copy.deepcopy(settings)
    bad_nav["nav"] = [{"label": "x", "href": "javascript:alert(1)"}]
    assert client.put("/api/settings", json=bad_nav, headers=auth).status_code == 422
    bad_label = copy.deepcopy(settings)
    bad_label["labels"] = {"bad key!": "x"}
    assert client.put("/api/settings", json=bad_label, headers=auth).status_code == 422
    dup = copy.deepcopy(settings)
    dup["sections"] = dup["sections"] + dup["sections"][:1]
    assert client.put("/api/settings", json=dup, headers=auth).status_code == 422


# ---------------------------------------------------------------- about

def test_about_update(client, auth):
    about = {"name": "C", "title": "T", "bio": "B", "profile_pic": "/assets/profile.jpg",
             "skills": [], "socials": [{"platform": "GitHub", "url": "https://github.com/x"}]}
    res = client.put("/api/about", json=about, headers=auth)
    assert res.status_code == 200, res.text
    assert client.get("/api/about").json()["name"] == "C"
    about["socials"] = [{"platform": "x", "url": "javascript:alert(1)"}]
    assert client.put("/api/about", json=about, headers=auth).status_code == 422


# ---------------------------------------------------------------- API keys

def test_api_key_lifecycle(client, auth):
    created = client.post("/api/admin/api-keys", json={"name": "Claude"}, headers=auth)
    assert created.status_code == 200, created.text
    body = created.json()
    key, key_id = body["key"], body["id"]
    assert key.startswith("pwk_") and body["prefix"] == key[:12]
    as_key = {"Authorization": f"Bearer {key}"}

    # the key can edit content...
    res = client.post("/api/skills", json={"label": "From key", "items": ["x"]}, headers=as_key)
    assert res.status_code == 200, res.text
    # ...and its use is recorded
    listed = client.get("/api/admin/api-keys", headers=auth).json()
    assert next(k for k in listed if k["id"] == key_id)["last_used_at"] is not None
    # ...but it can't manage keys
    assert client.get("/api/admin/api-keys", headers=as_key).status_code == 403
    assert client.post("/api/admin/api-keys", json={"name": "more"}, headers=as_key).status_code == 403
    # the full key is never shown again
    assert "key" not in listed[0]

    assert client.delete(f"/api/admin/api-keys/{key_id}", headers=auth).status_code == 200
    assert client.post("/api/skills", json={"label": "x", "items": []}, headers=as_key).status_code == 401


def test_api_key_limit(client, auth):
    ids = []
    for i in range(12):
        res = client.post("/api/admin/api-keys", json={"name": f"k{i}"}, headers=auth)
        if res.status_code != 200:
            assert res.status_code == 400
            break
        ids.append(res.json()["id"])
    assert len(ids) <= 10
    for key_id in ids:
        client.delete(f"/api/admin/api-keys/{key_id}", headers=auth)


# ---------------------------------------------------------------- media + contact

def test_media_rejects_other_files(client, auth):
    res = client.post("/api/media", files={"file": ("a.txt", b"hi", "text/plain")}, headers=auth)
    assert res.status_code == 400


def test_contact(client, monkeypatch):
    sent = []
    monkeypatch.setattr(main_module.resend.Emails, "send", lambda params: sent.append(params) or {"id": "1"})
    ok = {"name": "Ada <b>", "email": "ada@example.com", "message": "<script>x</script>"}
    assert client.post("/api/contact", json=ok).status_code == 200
    assert "<script>" not in sent[0]["html"] and "&lt;script&gt;" in sent[0]["html"]
    assert sent[0]["reply_to"] == "ada@example.com"
    assert client.post("/api/contact", json={**ok, "email": "not-an-email"}).status_code == 422
    codes = [client.post("/api/contact", json=ok).status_code for _ in range(3)]
    assert codes[-1] == 429  # 3 per minute
