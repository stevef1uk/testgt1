from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict, Tuple
import uuid

app = FastAPI()

# In‑memory high score store: session_id -> (score, timestamp)
high_score_store: Dict[str, Tuple[int, int]] = {}

# Mount static files (frontend assets)
# Attempt to mount static files; ignore if the directory does not exist (will be provided later)
try:
    app.mount(
        "/static",
        StaticFiles(directory="defender/frontend", html=True),
        name="static",
    )
except RuntimeError:
    # Directory missing – continue without static file serving for now.
    pass


@app.get("/")
async def get_root():
    """
    Serve the main HTML page.
    """
    return FileResponse("defender/frontend/index.html")


def _get_or_create_session_id(request: Request) -> str:
    """
    Retrieve the session_id cookie from the request, or create a new one.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
    return session_id


@app.get("/score")
async def get_score():
    """
    Return all high scores as a JSON object keyed by session_id.
    """
    return {
        session_id: {"score": score, "timestamp": timestamp}
        for session_id, (score, timestamp) in high_score_store.items()
    }


@app.post("/score")
async def post_score(request: Request):
    """
    Accept a JSON payload with `score` (int) and `timestamp` (int).
    Store the score only if it is higher than any previous score for that session.
    Returns a JSON response with status "ok". Sets a `session_id` cookie if one was created.
    """
    payload = await request.json()
    score = payload.get("score")
    timestamp = payload.get("timestamp")
    if not isinstance(score, int) or not isinstance(timestamp, int):
        raise HTTPException(status_code=400, detail="Invalid payload")
    session_id = _get_or_create_session_id(request)
    existing = high_score_store.get(session_id)
    if existing is None or score > existing[0]:
        high_score_store[session_id] = (score, timestamp)
    response = JSONResponse(content={"status": "ok"})
    response.set_cookie(key="session_id", value=session_id)
    return response
