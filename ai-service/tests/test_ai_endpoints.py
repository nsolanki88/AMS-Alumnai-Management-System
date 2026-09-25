import pytest
from app.services.discovery_engine import DiscoveryEngine
from app.services.doubt_classifier import DoubtClassifier
from app.services.recommendation_engine import RecommendationEngine
from app.services.chatbot_nlp import ChatbotNLP

def test_discovery_confidence_scoring():
    record = {
        "name": "Rahul Sharma",
        "college": "State Engineering Institute",
        "graduation_year": 2022,
        "branch": "CSE",
        "company": "Google",
        "job_title": "Senior SWE"
    }
    matches = DiscoveryEngine.discover_public_candidates(record)
    assert len(matches) >= 1
    assert matches[0]["confidenceScore"] >= 70
    assert len(matches[0]["reasons"]) > 0
    assert "name" in matches[0]

def test_doubt_classification():
    title = "How to prepare for System Design and DSA coding interviews?"
    description = "Need guidance on LeetCode patterns and scalable architecture."
    category, skills, confidence = DoubtClassifier.classify_and_extract(title, description)
    assert category == "Interview Preparation"
    assert any("System Design" in s or "Dsa" in s for s in skills)
    assert confidence > 0.7

def test_alumni_recommendation_ranking():
    category = "Interview Preparation"
    skills = ["React", "System Design"]
    candidates = [
        {
            "id": "c1",
            "fullName": "Junior Dev",
            "currentCompany": "StartUp",
            "currentRole": "Junior Frontend Developer",
            "skills": ["HTML", "CSS"],
            "isMentor": False
        },
        {
            "id": "c2",
            "fullName": "Senior Tech Lead",
            "currentCompany": "Google",
            "currentRole": "Senior Staff Engineer",
            "skills": ["React", "System Design", "Kubernetes"],
            "isMentor": True
        }
    ]
    recommendations = RecommendationEngine.rank_alumni(category, skills, candidates)
    assert len(recommendations) == 2
    # The Senior Tech Lead with matching skills must rank higher
    assert recommendations[0]["alumniId"] == "c2"
    assert recommendations[0]["recommendationScore"] > recommendations[1]["recommendationScore"]

def test_chatbot_rbac_filtering():
    # Student asking for council-restricted discovery
    intent, entities, confidence = ChatbotNLP.parse_query(
        "Find potential profiles for unregistered alumni", "STUDENT"
    )
    assert intent == "restricted_council_intent"

    # Council asking the same
    intent_council, _, _ = ChatbotNLP.parse_query(
        "Find potential profiles for unregistered alumni", "COUNCIL"
    )
    assert intent_council == "council_discover_profiles"

    # Company search
    intent_comp, entities_comp, _ = ChatbotNLP.parse_query(
        "Find alumni working in Google", "STUDENT"
    )
    assert intent_comp == "find_alumni_by_company"
    assert entities_comp.get("company") == "Google"
