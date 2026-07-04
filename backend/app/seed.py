import os
import json
from sqlmodel import Session, SQLModel
from .database import engine 
from .models import Project, About, CreativeItem, User, LifePost
from .auth import get_password_hash
from dotenv import load_dotenv


load_dotenv()

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

def migrate_data():

    print("Creating tables in the target database...")
    SQLModel.metadata.create_all(engine)

    with open("app/data.json", "r") as file:
        data = json.load(file)

    with Session(engine) as session:
        print("Migrating About section...")
        about_data = data["about"]
        db_about = About(
            name=about_data["name"],
            title=about_data["title"],
            bio=about_data["bio"],
            profile_pic=about_data["profile_pic"],
            skills=about_data["skills"],
            socials=about_data["socials"]
        )
        session.add(db_about)

        print("Migrating Projects...")
        for p in data["projects"]:
            db_project = Project(
                title=p["title"],
                description=p["description"],
                tech_stack=p["tech_stack"],
                github_url=p["github_url"],
                featured=p["featured"],
                category=p["category"],
                difficulty=p["difficulty"]
            )
            session.add(db_project)

        print("Migrating Creative items...")
        for c in data["creative"]:
            db_creative = CreativeItem(
                title=c["title"],
                description=c["description"],
                tech=c["tech"],
                video_path=c["video_path"]
            )
            session.add(db_creative)

        print("Creating Admin User...")
        admin_username = os.getenv("ADMIN_USERNAME")
        admin_password = os.getenv("ADMIN_PASSWORD")

        if admin_username and admin_password:
            admin_user = User(
                username=admin_username,
                hashed_password=get_password_hash(admin_password)
            )
            session.add(admin_user)
        else:
            print("WARNING: Admin credentials not found in .env!")

        print("Migrating Life Posts...")
        test_posts = [
            {"title": "Morning Coffee", "caption": "Lund feels cozy today.", "category": "Life", "image_url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800"},
            {"title": "C++ Debugging", "caption": "The black hole is finally rendering.", "category": "Code", "image_url": "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800"}
        ]
        
        for p in test_posts:
            # Explicitly map the fields to avoid the "id" type error
            db_post = LifePost(
                title=p["title"],
                caption=p["caption"],
                category=p["category"],
                image_url=p["image_url"]
            )
            session.add(db_post)

        session.commit() 
        print("Migration complete! Data has been synced to the database.")

if __name__ == "__main__":
    migrate_data()