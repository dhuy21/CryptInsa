#!/bin/bash

# Détecter le système pour choisir le bon navigateur opener
open_browser() {
  URL=$1
  if command -v xdg-open &> /dev/null; then
    xdg-open "$URL"
  elif command -v open &> /dev/null; then
    open "$URL"
  elif command -v start &> /dev/null; then
    start "$URL"
  else
    echo "Impossible d'ouvrir le navigateur automatiquement. Ouvre manuellement : $URL"
  fi
}

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js ou npm est absent. Installez-les, puis relancez ce script :"
  echo "sudo apt-get install -y nodejs npm"
  exit 1
fi

# Créer un venv si besoin. Ne pas installer de paquet système depuis ce script.
if [ ! -d "venv" ]; then
  echo "Creation de l'environnement virtuel..."
  if ! python3 -m venv venv; then
    echo "Le module venv est absent. Installez-le, puis relancez ce script :"
    echo "sudo apt update && sudo apt install -y python3-venv"
    exit 1
  fi
fi

source venv/bin/activate || { echo "Impossible d'activer le venv"; exit 1; }

echo "Installation des dependances Python (VENV)..."
pip install -r backend/requirements.txt

echo "Demarrage du serveur Flask..."
cd backend || exit
export FLASK_APP=app.py
export FLASK_ENV=development
flask run > ../flask.log 2>&1 &
FLASK_PID=$!
cd ..

echo "Installation des dependances npm..."
cd frontend || { kill "$FLASK_PID" 2>/dev/null; exit 1; }

if [ ! -f "package.json" ]; then
  echo "Erreur: package.json introuvable dans le dossier frontend"
  kill "$FLASK_PID" 2>/dev/null
  exit 1
fi

if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo "Installation/mise à jour des packages npm..."
  npm install || { echo "Echec de l'installation npm"; kill "$FLASK_PID" 2>/dev/null; exit 1; }
else
  echo "Les packages npm sont déjà installés et à jour."
fi

echo "Demarrage du serveur Express sur http://127.0.0.1:8000 ..."
echo ""
echo "POUR UTILISER NODEMON DE MANIERE INTERACTIVE :"
echo "1. Ouvrez un nouveau terminal"
echo "2. Executez: cd frontend && npm run dev"
echo "3. Utilisez 'rs' pour redemarrer le serveur"
echo ""
echo "POUR L'INSTANT: Demarrage en arriere-plan..."

npm run dev > ../frontend.log 2>&1 &
HTTP_PID=$!
cd ..

sleep 2

open_browser "http://127.0.0.1:8000"

echo "=== SERVEURS DEMARRES ==="
echo "Frontend (Express + nodemon): http://127.0.0.1:8000"
echo "Backend (Flask): http://127.0.0.1:5000"
echo "=== Appuyez sur Ctrl+C pour arreter les serveurs ==="

trap "echo 'Arret des serveurs...'; kill $FLASK_PID $HTTP_PID 2>/dev/null" SIGINT
wait
