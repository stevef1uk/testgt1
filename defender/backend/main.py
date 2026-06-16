from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Mount static files directory (serves files from defender/web)
app.mount("/static", StaticFiles(directory="defender/web", html=True), name="static")

# In‑memory high‑score store
_high_score = 0

def _index_path() -> str:
    """Return absolute path to the index.html file."""
    return os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page."""
    index_path = _index_path()
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(
            content="<html><body><h1>Defender Service</h1><p>Index not found.</p></body></html>"
        )

@app.get("/score")
async def get_score():
    """Return the current high‑score."""
    return {"high_score": high_score}

@app.post("/score")
async def update_score(request: Request):
    """
    Update the in‑memory high‑score.
    Expected JSON payload: {"score": <int>}
    """
    data = await request.json()
    new_score = data.get("score")
    if isinstance(new_score, int):
        global _high_score
        if new_score > _high_score:
            _high_score = new_score
    return JSONResponse(content={"score": _high_score})
