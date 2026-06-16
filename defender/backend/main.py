from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os

app = FastAPI()

# Mount static files (serves files from defender/web)
# Serve static files from the web directory relative to this file
static_dir = os.path.join(os.path.dirname(__file__), "..", "web")
app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")

# In‑memory score store
_score = {"score": 0}

class ScoreUpdate(BaseModel):
    value: int

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """
    Serve the main HTML page (index.html) from the static web directory.
    """
    index_path = os.path.join(os.path.dirname(__file__), "..", "web", "index.html")
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content, status_code=200)
    except FileNotFoundError:
        return HTMLResponse(
            content="<html><body><h1>Defender Service</h1><p>Index not found.</p></body></html>",
            status_code=404,
        )

@app.get("/score", response_class=JSONResponse)
def get_score():
    """Return the current score."""
    return JSONResponse(content=_score, status_code=200)

@app.post("/score", response_class=JSONResponse)
def update_score(update: ScoreUpdate):
    """Update the score."""
    _score["score"] = update.value
    return JSONResponse(content=_score, status_code=200)
