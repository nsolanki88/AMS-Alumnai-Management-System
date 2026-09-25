from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import discovery, doubts, recommendations, chatbot

app = FastAPI(
    title="AMS+ AI Matching & NLP Service",
    description="Microservice providing AI profile discovery, weighted confidence scoring, question classification, alumni recommendation, and chatbot NLP parsing.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discovery.router)
app.include_router(doubts.router)
app.include_router(recommendations.router)
app.include_router(chatbot.router)

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AMS+ AI Service",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
