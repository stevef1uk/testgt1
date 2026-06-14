from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

app = FastAPI()

# In-memory store for the high score.
# The key is a session identifier (for simplicity we use a constant session here).
# The value is a dict with the current high score and the associated name.
high_score = {"score": 0, "name": "AAA"}

frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")


@app.get("/score")
def get_score():
    """Return the current high score."""
    return JSONResponse(content=high_score)


@app.post("/score")
def post_score(data: dict):
    """Update the high score if the submitted score is higher.

    The request body must be a JSON object with keys ``score`` (int) and
    ``name`` (str).  The name is truncated to the first three uppercase
    characters.  If the supplied score is greater than the stored one,
    the global ``high_score`` is updated and returned.
    """
    score = int(data.get("score", 0))
    name = str(data.get("name", "AAA"))[:3].upper() or "AAA"
    if score > high_score["score"]:
        high_score["score"] = score
        high_score["name"] = name
    return JSONResponse(content=high_score)


app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/")
def get_root():
    """Return the index.html as HTML."""
    from fastapi.responses import FileResponse
    return FileResponse(os.path.join(frontend_dir, "index.html"))
