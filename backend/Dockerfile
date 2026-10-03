FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=config.settings

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY manage.py .
COPY config/ config/
COPY api/ api/
COPY cryptage/cesar.py cryptage/decrypt.py \
     cryptage/main.py cryptage/mapping.py cryptage/frequences_lettres.py \
     cryptage/
COPY cryptage/dict.txt cryptage/reference_frequencies.json cryptage/donnees.json \
     cryptage/

USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "--timeout", "60", "config.wsgi:application"]
