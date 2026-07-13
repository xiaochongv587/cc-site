FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 先装依赖，利用镜像层缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 上传目录持久化挂载点
RUN mkdir -p /app/uploads

EXPOSE 7200

# gunicorn 启动，2 worker，超时 60s
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:7200", "--timeout", "60", "wsgi:app"]
