FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway dynamically assigns a PORT environment variable. We MUST use it, or the domain will fail to route!
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
