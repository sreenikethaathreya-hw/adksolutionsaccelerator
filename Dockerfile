FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python project files
COPY server.py ./
COPY financial_agent ./financial_agent/
COPY drive_rag_agent ./drive_rag_agent/
COPY drive_integration.py ./
COPY auth.py ./
COPY auth_endpoints.py ./
COPY api_endpoints.py ./
COPY user_service.py ./
COPY pyproject.toml ./

# Install Python packages
RUN pip install --no-cache-dir \
    fastapi>=0.115.5 \
    uvicorn[standard]>=0.32.1 \
    google-cloud-aiplatform>=1.93.0 \
    google-adk>=1.0.0 \
    pydantic>=2.10.6 \
    python-dotenv>=1.0.1 \
    python-jose[cryptography]==3.3.0 \
    passlib[bcrypt]==1.7.4 \
    bcrypt==3.2.2 \
    python-multipart>=0.0.9 \
    google-cloud-firestore>=2.19.0 \
    google-cloud-secret-manager>=2.20.0 \
    google-auth>=2.36.0 \
    google-auth-httplib2>=0.2.0 \
    google-auth-oauthlib>=1.2.1 \
    google-api-python-client>=2.154.0 \
    google-genai>=1.0.0 \
    email-validator>=2.2.0

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run application
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]