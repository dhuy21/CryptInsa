# CryptInsa

Interactive web app for learning monoalphabetic substitution and breaking it with French frequency analysis and a dictionary attack.

Built as a scientific-mediation project at INSA Centre-Val de Loire, with Xavier Bultel.

## What you can do

- Encrypt and decrypt a Caesar cipher on a 29-symbol alphabet (`a–z`, space, comma, period), including an interactive wheel.
- Build a substitution table (random, identity, reversed, Atbash, or custom) and encrypt a text in the browser.
- Launch an automatic attack: letter frequencies, space and `e` heuristics, punctuation, then a French dictionary of about 336,000 words.
- Replay each attack step and compare the result with the original plaintext when it was stored in the browser.

The interface is French first. Home, About, and Help also have English. The cipher tools stay in French.

## Stack

- React 19, TypeScript, Vite
- Django (JSON API only, no database models)
- Nginx in front of both services
- Docker Compose, GitHub Actions, Railway

## Run locally

Requirements: Python 3, Node.js, npm.

```bash
./run_dev.sh
```

The script creates `venv/`, installs `backend/requirements.txt`, starts Django on http://127.0.0.1:5000, and the React app on http://127.0.0.1:5173. The browser calls `/api`; Vite forwards those requests to Django and strips the `/api` prefix.

## Run with Docker

```bash
docker compose up --build
```

Open http://127.0.0.1:8000. Only the Nginx proxy publishes a port. `/` goes to the frontend container. `/api` is stripped and forwarded to Django. Frontend and backend are not exposed on the host.

## API

Public paths are prefixed with `/api` (Vite in dev, Nginx in Docker). Django itself serves them without that prefix.

| Method | Path | Role |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/cesar` | Caesar encrypt (`message`, `shift`) |
| POST | `/api/cesar/decrypt` | Caesar decrypt |
| GET | `/api/french-frequencies` | French reference frequencies |
| POST | `/api/analyze` | Letter-frequency ratios |
| POST | `/api/start_attack` | Start a substitution attack (`cipherText`) |
| POST | `/api/update_attack` | Poll attack steps (`attackId`) |

Attack state lives in process memory (at most 100 attacks). Plaintext, ciphertext, and the attack id live in the browser `localStorage`.

## Tests

```bash
cd backend && DJANGO_SECRET_KEY=test pytest
cd frontend-react && npm test
```

## Team

- Ted Barbier
- Jules Cochard
- Adam Errais
- Emmy Granier
- Nguyen Dinh-Huy
- Nguyen Nhat-Lam

Frequency-analysis background: [Wikipedia](https://fr.wikipedia.org/wiki/Analyse_de_fr%C3%A9quence).
