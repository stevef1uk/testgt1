# Defender Application

## Overview

This repository provides a **FastAPI** service that:

- Serves static assets (HTML, CSS, JavaScript) from the `defender/web/` directory.
- Exposes a simple JSON scoring endpoint at `/score`.
- Returns a basic HTML page at the root (`/`) path.

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

## API Endpoints

| Method | Path        | Description                                             |
|--------|-------------|---------------------------------------------------------|
| GET    | `/`         | Returns the main HTML page (`defender/web/index.html`). |
| GET    | `/score`    | Returns a JSON object with a random score, e.g. `{ "score": 42 }`. |
| GET    | `/static/{path}` | Serves static files from `defender/web/`.               |

## Static Files

All front‑end assets live in the `defender/web/` directory. FastAPI mounts this directory at `/static`, so any file placed there can be accessed via `/static/<filename>`.

Example structure:

defender/
└── web/
    ├── index.html
    ├── app.js
    └── style.css

## Testing

The test suite resides in `defender/backend/tests/`. Run the tests with **pytest**:

pytest defender/backend/tests/

The tests verify that:
- The root route (`/`) returns the HTML page.
- The static file route (`/static/{path}`) serves files correctly.
- The `/score` endpoint returns a JSON payload with a numeric `score`.
