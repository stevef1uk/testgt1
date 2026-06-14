from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict, Tuple

app = FastAPI()

# In‑memory high score store: user -> (score, timestamp)
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


@app.get("/score")
async def get_score():
    """
    Return all high scores as a JSON object:
    """
    return {
        user: {"score": score, "timestamp": timestamp}
        for user, (score, timestamp) in high_score_store.items()
    }


@app.post("/score")
async def post_score(request: Request):
    """
    Accept a JSON payload:
    Store the score only if it is higher than any previous score for that user.
    """
    data = await request.json()
    user = data.get("user")
    score = data.get("score")
    timestamp = data.get("timestamp")

    if not isinstance(user, str) or not isinstance(score, int) or not isinstance(timestamp, int):
        raise HTTPException(status_code=400, detail="Invalid payload")

    prev = high_score_store.get(user)
    if prev is None or score > prev[0]:
        high_score_store[user] = (score, timestamp)

    return JSONResponse(content={"status": "ok"})


# The FastAPI app instance is exported as `app` for the server entrypoint.