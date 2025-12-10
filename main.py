import os
import uvicorn
from google.adk.cli.fast_api import get_fast_api_app
from myagent.tools.database import PostgreSQLConnector
from dotenv import load_dotenv

load_dotenv()

# Database configuration
db_helper = PostgreSQLConnector()
SESSION_SERVICE_URI = db_helper.get_conn_string()

# CORS configuration
ALLOWED_ORIGINS = ["*"]  # Restrict in production

# Get FastAPI app from ADK
app = get_fast_api_app(
    agents_dir=os.path.dirname(os.path.abspath(__file__)),
    session_service_uri=SESSION_SERVICE_URI,
    allow_origins=ALLOWED_ORIGINS,
    web=True,  # Enable web interface for testing
    otel_to_cloud=True  # Enable tracing
)

app.description = "Financial Analysis Agent API"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))