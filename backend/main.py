import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

# Import our custom modules
from detector import detect_log_type
from analyzer import analyze_log_with_gemini

load_dotenv(override=True)

app = FastAPI(
    title="AI Log Analyzer API",
    description="Backend service for detecting log type and analyzing contents with Gemini AI",
    version="1.0.0"
)

# Enable CORS for Next.js frontend dev server (defaulting to http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For prototype, we allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_LOG_SIZE_BYTES = 100 * 1024  # 100 KB limit for AI prompt size

class TextAnalysisRequest(BaseModel):
    log_text: str

@app.get("/api/health")
async def health_check():
    api_key_configured = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "mock_mode": not api_key_configured,
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    }

def process_log_content(content: str) -> dict:
    """Helper to detect and analyze log content"""
    # Gracefully truncate if log exceeds size limits
    was_truncated = False
    if len(content.encode('utf-8')) > MAX_LOG_SIZE_BYTES:
        content = content[:MAX_LOG_SIZE_BYTES]
        content += "\n\n[TRUNCATED: LOG EXCEEDED 100KB PROTOTYPE LIMIT]"
        was_truncated = True

    # 1. Run rule-based type detection
    detected_type = detect_log_type(content)

    # 2. Run Gemini AI / Mock analysis
    analysis = analyze_log_with_gemini(content, detected_type)

    # Attach metadata
    analysis["detected_type"] = detected_type
    analysis["raw_log"] = content
    analysis["truncated"] = was_truncated
    analysis["live_ai"] = bool(os.getenv("GEMINI_API_KEY"))

    return analysis

@app.post("/api/analyze")
async def analyze_file(
    file: Optional[UploadFile] = File(None),
    log_text: Optional[str] = Form(None)
):
    """
    Endpoint accepting log files via multipart upload OR raw text via form data.
    """
    content = ""
    filename = "Manual Text Entry"

    if file:
        filename = file.filename
        # Check file extension
        if not (filename.endswith('.txt') or filename.endswith('.log') or '.' not in filename):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file format. Only .txt and .log files are supported."
            )
        try:
            bytes_content = await file.read()
            content = bytes_content.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    elif log_text:
        content = log_text
    else:
        raise HTTPException(
            status_code=400, 
            detail="No content provided. Please upload a file or submit log_text."
        )

    if not content.strip():
        raise HTTPException(status_code=400, detail="Provided log content is empty.")

    try:
        result = process_log_content(content)
        result["filename"] = filename
        return result
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal analysis failure: {str(e)}")

@app.post("/api/analyze/text")
async def analyze_raw_text(request: TextAnalysisRequest):
    """
    Alternative endpoint accepting JSON with raw log text.
    """
    if not request.log_text.strip():
        raise HTTPException(status_code=400, detail="Log content is empty.")
    
    try:
        result = process_log_content(request.log_text)
        result["filename"] = "Raw Text Input"
        return result
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal analysis failure: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
