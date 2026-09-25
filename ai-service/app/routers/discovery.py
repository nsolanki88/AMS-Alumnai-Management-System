from fastapi import APIRouter, HTTPException
from app.schemas.schemas import DiscoveryRequest, DiscoveryResponse, MatchCompareRequest, MatchCompareResponse
from app.services.discovery_engine import DiscoveryEngine

router = APIRouter(prefix="/ai", tags=["AI Discovery"])

@router.post("/discover", response_model=DiscoveryResponse)
def discover_profiles(request: DiscoveryRequest):
    try:
        record_dict = request.model_dump()
        matches = DiscoveryEngine.discover_public_candidates(record_dict)
        return {"matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match", response_model=MatchCompareResponse)
def compare_match(request: MatchCompareRequest):
    try:
        record = {
            "name": request.record_name,
            "college": request.record_college,
            "graduation_year": request.record_year,
            "branch": request.record_branch,
            "company": request.record_company
        }
        candidate = {
            "name": request.profile_name,
            "college": request.profile_college,
            "graduation_year": request.profile_year,
            "branch": request.profile_branch,
            "company": request.profile_company
        }
        score, reasons, signals = DiscoveryEngine.compute_match_score(record, candidate)
        return {
            "confidence_score": score,
            "reasons": reasons,
            "signals": signals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
