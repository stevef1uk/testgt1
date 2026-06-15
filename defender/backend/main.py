from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path

app = FastAPI()

class HighScoreStore:
    def __init__(self):
        self.high_score = 0
    def post(self, score):
        if score < 0:
            raise ValueError("Score must be non-negative")
        if score > self.high_score:
            self.high_score = score
    def get(self):
        return self.high_score

store = HighScoreStore()

class ScorePayload(BaseModel):
    score: int

static_dir = Path(__file__).resolve().parent.parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_class=HTMLResponse)
def root():
    index_path = Path(__file__).resolve().parent.parent / "frontend" / "index.html"
    return HTMLResponse(content=index_path.read_text())

@app.get("/score")
def get_score():
    return {"high_score": store.get()}

@app.post("/score")
def post_score(payload: ScorePayload):
    try:
        store.post(payload.score)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {"high_score": store.get()}
