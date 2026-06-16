from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import random

app = FastAPI()

# Mount static files directory (serves files from defender/web)
app.mount("/static", StaticFiles(directory="defender/web", html=True), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head><title>Defender</title></head>
        <body><h1>Welcome to Defender</h1></body>
    </html>
    """

@app.get("/score")
async def score():
    return {"score": random.randint(0, 100)}
