FROM python:3.12-slim

ARG VERSION=dev
LABEL org.opencontainers.image.title="cc-site-backend" \
      org.opencontainers.image.description="Flask API for cc-site personal website" \
      org.opencontainers.image.version="${VERSION}"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_INDEX_URL=https://mirrors.cloud.tencent.com/pypi/simple \
    PIP_TRUSTED_HOST=mirrors.cloud.tencent.com

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -U pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN mkdir -p /app/uploads

EXPOSE 7200

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7200/api/health')" || exit 1

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:7200", "--timeout", "60", "wsgi:app"]
