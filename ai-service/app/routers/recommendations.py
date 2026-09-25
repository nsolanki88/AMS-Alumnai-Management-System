from fastapi import APIRouter, HTTPException
from app.schemas.schemas import RecommendAlumniRequest, RecommendAlumniResponse
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/ai", tags=["Recommendations"])

@router.post("/recommend-alumni", response_model=RecommendAlumniResponse)
def recommend_alumni(request: RecommendAlumniRequest):
    try:
        recommendations = RecommendationEngine.rank_alumni(
            request.question_category,
            request.extracted_skills,
            request.candidates
        )
        return {"recommendations": recommendations[:5]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
