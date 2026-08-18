FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run the server on port 8080 (Matches user Railway settings)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
