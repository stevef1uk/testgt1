from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

app = FastAPI()

high_score = {"score": 0, "name": "AAA"}

frontend_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


@app.get("/")
async def root():
    from fastapi.responses import FileResponse
    index = os.path.join(frontend_dir, "index.html")
    return FileResponse(index)


@app.post("/score")
async def post_score(data: dict):
    score = data.get("score", 0)
    name = data.get("name", "AAA")[:3].upper() or "AAA"
    if score > high_score["score"]:
        high_score["score"] = score
        high_score["name"] = name
    return JSONResponse(high_score)


@app.get("/score")
async def get_score():
    return JSONResponse(high_score)
