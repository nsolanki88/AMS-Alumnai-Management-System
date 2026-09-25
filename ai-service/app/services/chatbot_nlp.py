import re
from typing import Dict, Any, Tuple

class ChatbotNLP:
    """
    Parses natural language queries, extracts entities (company, batch, branch, skill),
    and determines intent while respecting Role-Based Access Control.
    """

    COMPANIES = ["google", "microsoft", "amazon", "meta", "apple", "netflix", "adobe", "uber", "goldman sachs", "tesla", "qualcomm", "tcs", "infosys", "siemens"]
    BRANCHES = ["cse", "ece", "me", "it", "ee", "civil", "mechanical", "electrical"]
    SKILLS = ["python", "react", "java", "machine learning", "aws", "docker", "system design", "data science", "cloud", "robotics"]

    @classmethod
    def parse_query(cls, query: str, user_role: str) -> Tuple[str, Dict[str, Any], float]:
        q = query.lower().strip()
        entities = {}

        # 1. Extract Company
        for comp in cls.COMPANIES:
            if comp in q:
                entities["company"] = comp.title()
                break

        # 2. Extract Batch / Year
        year_match = re.search(r'\b(20\d{2})\b', q)
        if year_match:
            entities["batch"] = int(year_match.group(1))

        # 3. Extract Branch
        for br in cls.BRANCHES:
            if re.search(r'\b' + re.escape(br) + r'\b', q):
                entities["branch"] = br.upper()
                break

        # 4. Extract Skills
        for sk in cls.SKILLS:
            if sk in q:
                entities["skill"] = sk
                break

        # 5. Extract Person Name if query says "for <Name>"
        name_match = re.search(r'for\s+([A-Za-z\s]+?)(?:,|$|\bin\b|\bfrom\b)', query, re.IGNORECASE)
        if name_match:
            candidate_name = name_match.group(1).strip()
            if candidate_name and len(candidate_name.split()) >= 1:
                entities["name"] = candidate_name

        # 6. Intent Resolution
        intent = "general_query"
        confidence = 0.85

        if any(w in q for w in ["working in", "working at", "company"]) or entities.get("company"):
            intent = "find_alumni_by_company"
            confidence = 0.92
        elif any(w in q for w in ["workshop", "conduct", "hands-on", "talk"]):
            intent = "workshop_inquiry"
            confidence = 0.90
        elif any(w in q for w in ["mentor", "mentorship", "guidance"]):
            intent = "find_mentors_by_skill"
            confidence = 0.91
        elif entities.get("batch") or entities.get("branch") or "batch" in q:
            intent = "filter_batch_alumni"
            confidence = 0.88
        elif any(w in q for w in ["potential", "discover", "unregistered"]):
            if user_role in ["COUNCIL", "ADMIN"]:
                intent = "council_discover_profiles"
                confidence = 0.95
            else:
                intent = "restricted_council_intent"
                confidence = 0.95

        return intent, entities, round(confidence, 2)
