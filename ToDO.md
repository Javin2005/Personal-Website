### 3. Action Plan (The Road Map)

Now that the skeletons are built, follow this order to ensure you don't get overwhelmed.

#### Phase 1: The "Hello World" Bridge (Week 1)
*   **Backend:** Write a simple `@app.get("/")` route in `main.py` that returns `{"message": "Hello from FastAPI"}`.
*   **Frontend:** Use the `useEffect` hook and `fetch()` in React to call that endpoint and display the text on the screen.
*   **Crucial Step:** You will hit a **CORS error**. Don't use AI—read the [FastAPI Middleware Docs](https://fastapi.tiangolo.com/tutorial/cors/) to learn how to fix it.

#### Phase 2: The Data Schema (Week 2)
*   Define what a "Project" looks like. Create a **Pydantic Model** in the backend and a matching **TypeScript Interface** in the frontend. 
*   *Why?* This ensures that if you change a field name in Python, you know exactly what to change in TS. This is the "Object Oriented Modeling" part of your degree in practice.

#### Phase 3: The Content Strategy (Week 3)
*   Decide how to store your data.
    *   **Level 1 (Easy):** A hardcoded JSON file in the backend.
    *   **Level 2 (Better):** Markdown files in a folder that the backend parses (great for blog posts).
    *   **Level 3 (Professional):** A PostgreSQL database (using **SQLAlchemy** or **SQLModel**).

#### Phase 4: Refinement & Polish
*   **Theming:** Implement Dark/Light mode using Tailwind.
*   **Deployment:** Use **Docker** to containerize both. This is a skill very highly valued in Swedish tech companies like Ericsson, Axis, or startups in Malmö/Lund.

### Pro-Tip for an LTH Student:
When you write your "About Me" or "Project Description," write it like a **Technical Report**. Mention the trade-offs you made. For example: *"I chose FastAPI over Flask because of native asynchronous support and Pydantic validation, which reduced my boilerplate code by 30%."* This proves you aren't just a coder, but an engineer.