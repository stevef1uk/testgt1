# Defender Application

This repository provides a **FastAPI** service that serves static files and a simple JSON scoring endpoint.

## Table of Contents
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Static Files](#static-files)
- [Testing](#testing)

## Installation

1. **Create a virtual environment** (recommended):
   python -m venv venv
   source venv/bin/activate

2. **Install dependencies**:
   pip install -r defender/backend/requirements.txt

## Running the Server

Start the FastAPI server with **uvicorn**:

uvicorn defender.backend.main:app --host 0.0.0.0 --port 8000 --reload

The service will be reachable at `http://localhost:8000`.

- `/` – returns a simple HTML page.
- `/score` – returns a JSON object with a random score.
- `/static/{path}` – serves static assets from `defender/web/`.

## Static Files

All static content lives in `defender/web/`. FastAPI mounts this directory at `/static`, so any front‑end assets placed there are served automatically.

## Testing

The test suite lives in `defender/backend/tests/`. Run the tests with **pytest**:

pytest defender/backend/tests/

The tests verify that the root route returns HTML, the static file route serves files correctly, and the `/score` endpoint returns JSON.
