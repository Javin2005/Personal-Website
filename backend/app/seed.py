"""Fill the database with the starting content from default_content.py.

    poetry run python -m app.seed              # safe: only adds what's missing
    poetry run python -m app.seed --refresh    # also overwrite About text and
                                               # project descriptions

What "only adds what's missing" means:
- the admin user is created if it doesn't exist (from ADMIN_USERNAME /
  ADMIN_PASSWORD in .env)
- About is created if there is none
- experience, education, skills and interests are filled only if empty
- each project is added unless a project with the same GitHub repo exists

Run it against the live database by pointing DATABASE_URL in your .env at
Supabase while you run it.
"""
import os
import sys

from dotenv import load_dotenv
from sqlmodel import Session, select

from . import default_content as content
from .auth import get_password_hash
from .database import engine, run_migrations
from .models import About, Education, Experience, Project, SkillGroup, User

load_dotenv()


def repo_name(url):
    return (url or "").rstrip("/").split("/")[-1].lower()


def fill_if_empty(session, model, rows, label):
    if session.exec(select(model)).first():
        print(f"  {label}: already has content, left alone")
        return
    for position, row in enumerate(rows):
        session.add(model(**row, sort_order=position))
    print(f"  {label}: added {len(rows)}")


def seed(refresh: bool = False):
    print("Updating database structure...")
    run_migrations()

    with Session(engine) as session:
        username = os.getenv("ADMIN_USERNAME")
        password = os.getenv("ADMIN_PASSWORD")
        if username and password:
            if not session.exec(select(User).where(User.username == username)).first():
                session.add(User(username=username, hashed_password=get_password_hash(password)))
                print("  admin user: created")
            else:
                print("  admin user: exists")
        else:
            print("  admin user: ADMIN_USERNAME / ADMIN_PASSWORD not set in .env, skipped")

        about = session.exec(select(About)).first()
        if not about:
            session.add(About(**content.ABOUT))
            print("  about: created")
        elif refresh:
            for key, value in content.ABOUT.items():
                setattr(about, key, value)
            session.add(about)
            print("  about: overwritten (--refresh)")
        else:
            print("  about: exists, left alone")

        fill_if_empty(session, SkillGroup, content.SKILL_GROUPS, "skills")
        fill_if_empty(session, Experience, content.EXPERIENCE, "experience")
        fill_if_empty(session, Education, content.EDUCATION, "education")

        existing = {repo_name(p.github_url): p for p in session.exec(select(Project)).all()}
        for position, data in enumerate(content.PROJECTS):
            fields = {k: v for k, v in data.items() if k not in ("repo", "aliases")}
            match = next(
                (existing[name] for name in [data["repo"], *data["aliases"]] if name in existing),
                None,
            )
            if match is None:
                session.add(Project(**fields, sort_order=position))
                print(f"  project '{data['title']}': added")
            elif refresh:
                for key, value in fields.items():
                    setattr(match, key, value)
                match.sort_order = position
                session.add(match)
                print(f"  project '{data['title']}': overwritten (--refresh)")
            else:
                print(f"  project '{data['title']}': exists, left alone")

        session.commit()
    print("Done.")


if __name__ == "__main__":
    seed(refresh="--refresh" in sys.argv)
