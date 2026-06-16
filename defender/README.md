# Polecat Defender

## Overview

This document provides instructions for installing, running, and interacting with the Polecat Defender application. It serves as a guide for developers and users to understand the project's setup and operation.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Assets](#frontend-assets)
- [Testing](#testing)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Python 3.9+
- `pip` package installer
- `venv` module

## Installation

1.  **Clone the repository:**
    git clone https://github.com/example/polecat-defender.git
    cd polecat-defender

2.  **Create and activate a virtual environment:**
    python -m venv venv
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    .\venv\Scripts\activate

3.  **Install project dependencies:**
    pip install -r defender/backend/requirements.txt

## Running the Application

To start the Polecat Defender application, use `uvicorn`:

uvicorn defender.backend.main:app --reload --host 0.0.0.0 --port 8000

The application will be accessible at `http://localhost:8000`.

## Frontend

The application serves a fullscreen HTML canvas at the root URL (`/`). The canvas is rendered by JavaScript modules located under `defender/frontend/`. Static assets (CSS, JavaScript) are served under the `/static/` path.

## Controls

- **Stop**: Press `Ctrl+C` in the terminal where the server is running.
- **Reload**: The `--reload` flag automatically restarts the server when source files change.
- **Log level**: Adjust with `--log-level <level>` (e.g., `info`, `debug`).ebug`).
- **Graceful shutdown**: Send a `SIGTERM` signal; `uvicorn` will finish active requests before exiting.

## API Endpoints

The application exposes the following API endpoints:

| Method | Path         | Description                                                         |
|--------|--------------|------------------------------------------------------|---------------|
| `GET`  | `/`          | Serves the main HTML page (`defender/frontend/index.html`).         |
| `GET`  | `/score`     | Retrieves the current high score. Example response: `{"score": 100}`.         |
| `POST` | `/score`     | Updates the high score. Expects a JSON payload like `{"score": <integer>}`. |
| `GET`  | `/static/{path}` | Serves static files from the `defender/frontend/` directory.                |

## Frontend Assets

Static frontend files (HTML, CSS, JavaScript) are located in the `defender/frontend/` directory. These files are served under the `/static/` path by the FastAPI application.

## Testing

To run the test suite:

1.  Navigate to the backend directory:
    cd defender/backend
2.  Execute the tests using `pytest`:
    pytestnts.txt
pytest -q

Ensure the server is not running while tests execute.

## Overview

This repository provides a **FastAPI** service that:

- Serves static assets (HTML, CSS, JavaScript) from the `defender/web/` directory.
- Implements an in-memory high-score store accessible via the `/score` endpoint.
- Serves the main HTML page at the root (`/`) path.

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
| GET    | `/score`    | Returns the current high-score as JSON, e.g. `{ "score": 42 }`. |
| POST   | `/score`    | Updates the high-score. Expects JSON payload `{ "score": <int> }`. Returns the stored high-score. |
| GET    | `/static/{path}` | Serves static files from `defender/web/`.               |

## Static Files

All front-end assets live in the `defender/web/` directory. FastAPI mounts this directory at `/static`, so any file placed there can be accessed via `/static/<filename>`.

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
- High score only updates when the new score is greater than the current one.
