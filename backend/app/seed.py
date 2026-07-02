import json
from sqlmodel import Session, create_engine, SQLModel
from .models import Project, About, CreativeItem


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

def migrate_data():

    print("Creating tables...")
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

        
        session.commit()
        print("Migration complete! 'database.db' has been created.")

if __name__ == "__main__":
    migrate_data()