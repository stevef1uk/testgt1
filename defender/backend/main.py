from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict, Tuple
import uuid
import time

app = FastAPI()

# In‑memory high score store: session_id -> (score, timestamp)
high_score_store: Dict[str, Tuple[int, int]] = {}

# Mount static files (frontend assets)
app.mount(
    "/static",
    StaticFiles(directory="defender/frontend", html=True),
    name="static",
)

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
    Accept a JSON payload with a ``score`` field (int).  Store the score
    together with the current timestamp for the caller's session.  If a
    previous score exists for the session, keep the higher one.
    Returns a JSON response containing the session_id, stored score and
    timestamp.  A ``session_id`` cookie is set if one was not already present.
    """
    payload = await request.json()
    if not isinstance(payload, dict) or "score" not in payload:
        raise HTTPException(status_code=400, detail="Missing 'score'")
    score = payload["score"]
    if not isinstance(score, int):
        raise HTTPException(status_code=400, detail="'score' must be int")
    session_id = _get_or_create_session_id(request)
    timestamp = int(time.time())
    existing = high_score_store.get(session_id)
    if existing is None or score > existing[0]:
        high_score_store[session_id] = (score, timestamp)
    response = JSONResponse(
        {"session_id": session_id, "score": score, "timestamp": timestamp}
    )
    response.set_cookie(key="session_id", value=session_id)
    return response
