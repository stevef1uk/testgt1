# Defender Application

## Installation

1. **Prerequisites**
   - Go 1.22+ installed ([download here](https://golang.org/dl/)).
   - Git.

2. **Clone the repository**

   git clone <repository-url>
   cd defender

3. **Prepare the Go modules**

   go mod tidy

   The project uses only the standard library and the in‑memory `ScoreStore`; no external database or services are required.

## Running the Application

# Build the binary (optional)
go build ./cmd/server

# Run directly
go run ./cmd/server/main.go

The server starts on `http://localhost:8080`. Open that URL in a browser to view the UI.

## Controls

| Action        | Key / Input |
|---------------|-------------|
| Move Up       | Arrow Up or `W` |
| Move Down     | Arrow Down or `S` |
| Move Left     | Arrow Left or `A` |
| Move Right    | Arrow Right or `D` |
| Shoot / Action| Space Bar |
| Pause         | `P` |
| Restart       | `R` |

These controls are wired to the frontend JavaScript in `backend/static/app.js`.

## Contribution

- Fork the repository and create a new branch for your feature or bug‑fix.
- Ensure the code builds and all tests pass:

  go test -count=1 ./...

- Follow the existing code style and run `go fmt`/`go vet` before submitting a PR.
- Document any new functionality in this README under the appropriate sections.

## Notes

- The application stores scores in an **in‑memory** dictionary (`ScoreStore`); no external database is required.
- All project paths are prefixed with `defender/`. This ensures consistency across the repository.ender/` as described in the architecture documentation.
