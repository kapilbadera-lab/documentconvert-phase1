
# The MultiLink Dot Com - SmartDocConvert (Phase 1)
Minimal starter project for Phase-1: upload CSV + photos, render card PDFs for MP/UP/GJ.

Contents:
- backend/: Node.js Express API
- frontend/: Minimal React Vite app
- worker/: Puppeteer worker to render templates
- templates/: sample HTML templates for MP/UP/GJ
- docker-compose.yml : local compose for testing
- render.yaml : Render.com import (basic)

Instructions:
1. Unzip and inspect files.
2. For local test: install Docker and run `docker-compose up --build`
3. For Render: push repo to GitHub and follow Render import steps (create Web Service for backend, Static Site for frontend, Background Worker for worker). Set environment variables as described in README.
