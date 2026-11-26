"""Starting content for the site.

The settings are used the first time the site starts with an empty
site_settings table. Everything else is only written by `python -m app.seed`.
After that, the admin page is the place to change things; editing this
file does not change a database that already has content.
"""

DEFAULT_SETTINGS = {
    "theme": {
        "bg": "#06070a",        # event horizon
        "surface": "#0d0f14",
        "text": "#ece7dc",      # warm starlight
        "muted": "#8d897f",     # dust
        "accent": "#e8955a",    # redshift: the receding side of the disk
        "accent2": "#8fb0d8",   # blueshift: the approaching side
        "fontDisplay": "Unbounded",
        "fontBody": "IBM Plex Sans",
        "fontMono": "IBM Plex Mono",
    },
    "video": {
        "enabled": True,
        "src": "/assets/blackhole.mp4",
        "opacity": 0.75,
        "dimOnScroll": True,
    },
    "hero": {
        "eyebrow": "Computer Science & Engineering · LTH",
        "firstLine": "Christian J.",
        "secondLine": "Carlson",
        "intro": (
            "Third-year student in Lund. I like maths, algorithms and getting "
            "physics to run in real time. The black hole behind this text is "
            "one of my projects."
        ),
        "status": "Currently applying for an exchange semester in the US.",
        "footer": ["Datateknik, LTH", "expected 2029", "Lund, Sweden"],
        "readout": [
            "Schwarzschild metric · RK4 integration",
            "10 000 photons · ~60 fps · C++ / raylib",
        ],
        "showPortrait": True,
    },
    "sections": [
        {"id": "about", "title": "About", "intro": "", "visible": True},
        {
            "id": "interests",
            "title": "Outside of code",
            "intro": "Some books, films and music I keep coming back to.",
            "visible": False,
        },
        {"id": "experience", "title": "Experience", "intro": "", "visible": True},
        {"id": "education", "title": "Education", "intro": "", "visible": True},
        {
            "id": "projects",
            "title": "Projects",
            "intro": "Things I've built outside of courses. The full list is on the projects page.",
            "visible": True,
        },
        {
            "id": "contact",
            "title": "Contact",
            "intro": "Questions about a project, an internship or anything else? Send me a message and I'll get back to you.",
            "visible": True,
        },
    ],
    "nav": [
        {"label": "About", "href": "/#about"},
        {"label": "Experience", "href": "/#experience"},
        {"label": "Projects", "href": "/projects"},
        {"label": "Tools", "href": "/tools"},
        {"label": "Contact", "href": "/#contact"},
    ],
    "contactEmail": "",
    "footerNote": "Built with React, FastAPI and Postgres. The source is on GitHub.",
    "showStatus": True,
    "projectsPageIntro": "Everything I've built, finished or not. Search by name or by language.",
    "toolsPageIntro": (
        "Small tools I've built and use myself, like calculators and file "
        "utilities. This page is new, so there isn't much here yet."
    ),
}

ABOUT = {
    "name": "Christian J. Carlson",
    "title": "Computer Science and Engineering student at LTH",
    "bio": (
        "I'm a third-year Computer Science and Engineering student at LTH, Lund "
        "University. I first tried programming about five years ago and was "
        "hooked fairly quickly. What I enjoy most is the problem-solving: taking "
        "something that works and refining it until it works better and faster, "
        "which is probably why I like algorithms so much.\n\n"
        "Lately I've been moving towards machine learning. I want to understand "
        "the maths behind it, not just call a library, and learn how to build it "
        "into real software. Outside of courses I build things like the black "
        "hole renderer in the background, a C++ algorithm library and this website."
    ),
    "profile_pic": "/assets/profile.jpg",
    "skills": [],
    "socials": [
        {"platform": "GitHub", "url": "https://github.com/Javin2005"},
        {"platform": "LinkedIn", "url": "https://www.linkedin.com/in/christian-j-carlson"},
    ],
}

SKILL_GROUPS = [
    {"label": "Use most days", "items": ["Python", "C++", "Git", "Linux"]},
    {"label": "Comfortable with", "items": ["Java", "TypeScript", "React", "FastAPI", "PostgreSQL", "LaTeX"]},
    {"label": "Have written some", "items": ["Haskell", "Scala", "C#"]},
]

EXPERIENCE = [
    {
        "role": "AI Trainer & Model Evaluator",
        "organisation": "Handshake AI",
        "location": "Remote",
        "period": "Summer 2026",
        "summary": (
            "Wrote prompts designed to find where AI models fail, then evaluated "
            "their answers across images, speech and audio, and code. Most of the "
            "work was judging accuracy, reasoning and whether the model actually "
            "followed the instructions, and writing structured feedback that went "
            "back into training."
        ),
        "tags": ["Prompt design", "Model evaluation", "Multimodal"],
    },
    {
        "role": "Coordinator and Host",
        "organisation": "ARKAD Career Fair, LTH",
        "location": "Lund",
        "period": "2024 – 2026",
        "summary": (
            "ARKAD is LTH's engineering career fair. I started as a host and went "
            "on to coordinate a team of hosts, helping plan the event beforehand "
            "and keeping things running during the fair. It also gave me a good "
            "look at the companies working in the fields I'm interested in."
        ),
        "tags": ["Event coordination", "Team lead"],
    },
    {
        "role": "Waiter, Bartender and Kitchen Assistant",
        "organisation": "ÅmaAB (university kitchen)",
        "location": "Lund",
        "period": "2022 – 2026",
        "summary": (
            "Front of house and kitchen work during busy services. Many tables at "
            "once, a lot of coordination with colleagues, and staying calm when "
            "everything happens at the same time."
        ),
        "tags": [],
    },
]

EDUCATION = [
    {
        "school": "Lund University, Faculty of Engineering (LTH)",
        "programme": "MSc in Engineering, Computer Science and Engineering (Datateknik)",
        "location": "Lund, Sweden",
        "period": "2024 – 2029 (expected)",
        "notes": "A five-year integrated master's programme. I've finished the first two years and I'm in my third.",
        "courses": [
            "Algorithms, Data Structures and Complexity",
            "Object-Oriented Modelling and Design",
            "Functional Programming",
            "Computer Communication",
            "Linear Algebra",
            "Multivariable Calculus",
            "Applied Mathematics – Linear Systems",
            "Digital Systems Design",
            "Computer Engineering",
        ],
    },
]

# `repo` is used to recognise a project that already exists in the database,
# so running the seed again updates it instead of adding a duplicate.
PROJECTS = [
    {
        "repo": "blackhole-render",
        "aliases": ["blacked_hole", "blackhole"],
        "title": "Black Hole Renderer",
        "description": (
            "A real-time renderer for a Schwarzschild black hole. Light rays are "
            "traced through curved spacetime with fourth-order Runge–Kutta "
            "integration, so the accretion disk bends around the hole the way it "
            "would in reality. Reworking the memory layout and batching the draw "
            "calls took it from about 1,000 to over 10,000 photons at roughly "
            "60 fps on a mid-range laptop."
        ),
        "tech_stack": ["C++", "raylib", "RK4", "Ray tracing"],
        "github_url": "https://github.com/Javin2005/BlackHole-Render",
        "media_url": "/assets/blackhole.mp4",
        "featured": True,
        "category": "Graphics & physics",
        "difficulty": 5,
        "period": "2026",
    },
    {
        "repo": "personal-website",
        "aliases": [],
        "title": "This website",
        "description": (
            "The site you're on. A React and TypeScript frontend on Vercel, a "
            "FastAPI backend on Render and a Postgres database on Supabase. Almost "
            "everything here, including the colors and fonts, can be edited from "
            "an admin page I built for it."
        ),
        "tech_stack": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS"],
        "github_url": "https://github.com/Javin2005/Personal-Website",
        "live_url": "https://www.javincarlson.com",
        "featured": True,
        "category": "Full stack",
        "difficulty": 4,
        "period": "2026",
    },
    {
        "repo": "algoritmerlib",
        "aliases": [],
        "title": "C++ Algorithm Laboratory",
        "description": (
            "Algorithms and data structures implemented from scratch in modern C++, "
            "from stable matching to network flows. Each one is kept in its own "
            "module, and a small template-based timer checks that the running "
            "times match the complexity on paper."
        ),
        "tech_stack": ["C++20", "CMake", "Templates"],
        "github_url": "https://github.com/Javin2005/AlgoritmerLib",
        "featured": True,
        "category": "Algorithms",
        "difficulty": 4,
        "period": "2026",
    },
    {
        "repo": "ml-from-scratch",
        "aliases": [],
        "title": "ML From Scratch",
        "description": (
            "Re-implementing landmark machine learning papers from first principles "
            "to understand what the libraries actually do: backpropagation, an "
            "autograd engine, CNNs and ResNets, and finally a small transformer. "
            "Just started."
        ),
        "tech_stack": ["Python", "NumPy", "PyTorch"],
        "github_url": "https://github.com/Javin2005/ML-from-Scratch",
        "featured": False,
        "category": "Machine learning",
        "difficulty": 4,
        "period": "2026 –",
    },
    {
        "repo": "horse-racing-proto",
        "aliases": [],
        "title": "Horse racing game",
        "description": "A small horse racing game I made for my dad.",
        "tech_stack": ["Python", "HTML"],
        "github_url": "https://github.com/Javin2005/Horse-racing-proto",
        "featured": False,
        "category": "Games",
        "difficulty": 2,
        "period": "2026",
    },
    {
        "repo": "minir-knare-i-haskell",
        "aliases": [],
        "title": "Calculator in Haskell",
        "description": "A small calculator written to learn Haskell.",
        "tech_stack": ["Haskell"],
        "github_url": "https://github.com/Javin2005/Minir-knare-i-haskell",
        "featured": False,
        "category": "Learning",
        "difficulty": 2,
        "period": "2026",
    },
    {
        "repo": "complex",
        "aliases": [],
        "title": "Complex numbers in Scala",
        "description": "Quick arithmetic on complex numbers, written while learning Scala.",
        "tech_stack": ["Scala"],
        "github_url": "https://github.com/Javin2005/Complex",
        "featured": False,
        "category": "Learning",
        "difficulty": 1,
        "period": "2026",
    },
]
