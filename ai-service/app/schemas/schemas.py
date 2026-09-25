from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DiscoveryRequest(BaseModel):
    name: str
    college: Optional[str] = "State Engineering Institute"
    graduation_year: int
    branch: str
    company: Optional[str] = ""
    job_title: Optional[str] = ""
    location: Optional[str] = ""

class PotentialProfileMatch(BaseModel):
    name: str
    platform: str
    profileUrl: str
    confidenceScore: int
    reasons: List[str]
    matchingAttributes: Dict[str, Any]

class DiscoveryResponse(BaseModel):
    matches: List[PotentialProfileMatch]

class MatchCompareRequest(BaseModel):
    record_name: str
    profile_name: str
    record_college: str
    profile_college: str
    record_year: int
    profile_year: int
    record_branch: str
    profile_branch: str
    record_company: Optional[str] = ""
    profile_company: Optional[str] = ""

class MatchCompareResponse(BaseModel):
    confidence_score: int
    reasons: List[str]
    signals: Dict[str, float]

class QuestionClassifyRequest(BaseModel):
    title: str
    description: str

class QuestionClassifyResponse(BaseModel):
    category: str
    extractedSkills: List[str]
    confidence: float

class AlumniCandidate(BaseModel):
    id: str
    fullName: str
    currentCompany: Optional[str] = None
    currentRole: Optional[str] = None
    skills: Optional[Any] = None
    isMentor: Optional[bool] = False
    alumniProfile: Optional[Any] = None
    mentorshipProfile: Optional[Any] = None

class RecommendAlumniRequest(BaseModel):
    question_category: str
    extracted_skills: List[str]
    candidates: List[Dict[str, Any]]

class AlumniRecommendationItem(BaseModel):
    alumniId: str
    fullName: str
    currentCompany: Optional[str] = ""
    currentRole: Optional[str] = ""
    recommendationScore: int
    reasons: List[str]

class RecommendAlumniResponse(BaseModel):
    recommendations: List[AlumniRecommendationItem]

class ChatIntentRequest(BaseModel):
    query: str
    user_role: str = "STUDENT"

class ChatIntentResponse(BaseModel):
    intent: str
    entities: Dict[str, Any]
    confidence: float
