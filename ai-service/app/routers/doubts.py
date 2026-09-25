from fastapi import APIRouter, HTTPException
from app.schemas.schemas import QuestionClassifyRequest, QuestionClassifyResponse
from app.services.doubt_classifier import DoubtClassifier

router = APIRouter(prefix="/ai", tags=["Doubts NLP"])

@router.post("/classify-question", response_model=QuestionClassifyResponse)
def classify_question(request: QuestionClassifyRequest):
    try:
        category, extracted_skills, confidence = DoubtClassifier.classify_and_extract(
            request.title, request.description
        )
        return {
            "category": category,
            "extractedSkills": extracted_skills,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
