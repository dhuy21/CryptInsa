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
- Docker Compose locally, GitHub Actions, AWS in production

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

## Production

There is one environment: https://cryptinsa.com. No staging server.

The browser talks to CloudFront. Hashed files in `/assets` come from a private S3 bucket. `/api` goes to one EC2 instance running Nginx and Django. Attack state stays in that one process, so there is no second copy of the API.

GitHub Actions on `main` deploys that environment after the tests in `.github/workflows/backend-tests.yml` pass. It assumes an IAM role with GitHub OIDC. There is no access key in the workflow. Pull requests only run tests. A frontend change does not restart Django. An image change does, and clears attacks stored in memory.

A clone does not contain AWS credentials, the Cloudflare API token, or Terraform state.

- `infra/prod` keeps its state in the S3 bucket `cryptinsa-tfstate-eu-west-3`. Someone who can read that bucket runs `terraform init` and `terraform plan` in `infra/prod`.
- `infra/bootstrap` created that bucket. Its state file stays on the machine that first applied it and is not in Git. Do not apply bootstrap again for this account.
- DNS changes need `CLOUDFLARE_API_TOKEN` in the environment. Do not commit it.
- App deploys are that same workflow. It can copy the origin scripts and the certificate timer back onto the existing instance. It does not create a new instance, and the Let's Encrypt account stays on that disk, not in Git.

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
