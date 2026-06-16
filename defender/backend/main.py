from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import random

app = FastAPI()

# Mount static files directory (serves files from defender/web)
app.mount("/static", StaticFiles(directory="defender/web", html=True), name="static")

import os

@app.get("/", response_class=HTMLResponse)
async def root():
    # Serve the static HTML page located in defender/web/index.html.
    index_path = os.path.join(os.path.dirname(__file__), "..", "web", "index.html")
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        # Fallback HTML if the file is missing.
        return HTMLResponse(content="<html><body><h1>Defender Service</h1><p>Index not found.</p></body></html>")

@app.get("/score")
async def score():
    return {"score": random.randint(0, 100)}
