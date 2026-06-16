from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI()

# In-memory store for score
_score = {"value": 0}

@app.get("/", response_class=HTMLResponse)
def root():
    """Root endpoint returning simple HTML page."""
    html_content = """
    <html>
        <head><title>Polecat Defender</title></head>
        <body>
            <h1>Welcome to Polecat Defender</h1>
            <p>Use the /score endpoint to get or set the score.</p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

class ScoreUpdate(BaseModel):
    value: int

@app.get("/score", response_class=JSONResponse)
def get_score():
    """Return the current score."""
    return JSONResponse(content=_score, status_code=200)

@app.post("/score", response_class=JSONResponse)
def update_score(update: ScoreUpdate):
    """Update the score with the provided value."""
    _score["value"] = update.value
    return JSONResponse(content=_score, status_code=200), Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Mount static files directory (serves files from defender/web)
app.mount("/static", StaticFiles(directory="defender/web", html=True), name="static")

# In-memory high-score store
_high_score = 0

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the main HTML page."""
    # Construct the path to index.html within the web directory
    index_path = os.path.join(os.path.dirname(__file__), "..", "web", "index.html")
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(
            content="<html><body><h1>Defender Service</h1><p>Index not found.</p></body></html>",
            status_code=404,
        )

@app.get("/score")
async def get_score():
    """Return the current high-score."""
    return JSONResponse(content={"score": _high_score})

@app.post("/score")
async def update_score(request: Request):
    """
    Update the in-memory high-score.
    Expected JSON payload: {"score": <int>}
    """
    try:
        data = await request.json()
        new_score = data.get("score")
        if isinstance(new_score, int):
            global _high_score
            if new_score > _high_score:
                _high_score = new_score
            return JSONResponse(content={"score": _high_score})
        else:
            raise HTTPException(status_code=400, detail="Invalid score format")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing request: {e}")
