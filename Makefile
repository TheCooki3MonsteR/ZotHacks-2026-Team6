# Run the backend (FastAPI) and frontend (Next.js) together:  make dev
# Windows + PowerShell. Needs GNU make (winget install ezwinports.make).
SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -Command

.PHONY: dev backend frontend install

# -j2 = run both targets at the same time. Stop both with Ctrl+C.
dev:
	$(MAKE) -j2 backend frontend

backend:
	cd backend; ..\.venv\Scripts\python.exe -m uvicorn main:app --reload

frontend:
	cd frontend; npm run dev

# One-time (or after git pull): install dependencies for both.
install:
	.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
	cd frontend; npm install
