FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_ENV=production

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY cryptage/cesar.py cryptage/vigenere.py cryptage/decrypt.py \
     cryptage/main.py cryptage/mapping.py cryptage/frequences_lettres.py \
     cryptage/
COPY cryptage/dict.txt cryptage/reference_frequencies.json cryptage/donnees.json \
     cryptage/

USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "--timeout", "60", "app:app"]
