import json
from typing import List, Dict, Any

class RecommendationEngine:
    """
    Ranks candidate verified alumni based on multi-criteria alignment:
    - Skill overlap (0.40)
    - Role & seniority (0.25)
    - Category relevance (0.20)
    - Mentor status & experience (0.15)
    """

    @staticmethod
    def parse_skills(candidate: Dict[str, Any]) -> List[str]:
        raw_skills = candidate.get("skills")
        if not raw_skills and "alumniProfile" in candidate and candidate["alumniProfile"]:
            raw_skills = candidate["alumniProfile"].get("skills")
        if not raw_skills and "mentorshipProfile" in candidate and candidate["mentorshipProfile"]:
            raw_skills = candidate["mentorshipProfile"].get("skills")

        if isinstance(raw_skills, list):
            return [s.lower() for s in raw_skills]
        elif isinstance(raw_skills, str):
            try:
                parsed = json.loads(raw_skills)
                if isinstance(parsed, list):
                    return [s.lower() for s in parsed]
            except Exception:
                return [s.strip().lower() for s in raw_skills.split(",") if s.strip()]
        return []

    @classmethod
    def rank_alumni(
        cls,
        question_category: str,
        extracted_skills: List[str],
        candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        target_skills = [s.lower() for s in extracted_skills]
        ranked_list = []

        for cand in candidates:
            score = 40  # baseline
            reasons = []

            cand_skills = cls.parse_skills(cand)
            cand_role = (cand.get("currentRole") or cand.get("alumniProfile", {}).get("currentRole", "")).lower()
            cand_company = cand.get("currentCompany") or cand.get("alumniProfile", {}).get("currentCompany", "")
            is_mentor = cand.get("isMentor", False) or cand.get("alumniProfile", {}).get("isMentor", False)

            # 1. Skill Overlap
            overlap = [s for s in cand_skills if any(ts in s or s in ts for ts in target_skills)]
            if overlap:
                score += len(overlap) * 15
                reasons.append(f"Domain skills match: {', '.join([s.title() for s in overlap[:3]])}")

            # 2. Category Relevance
            if question_category == "Interview Preparation":
                if "senior" in cand_role or "lead" in cand_role or "staff" in cand_role:
                    score += 15
                    reasons.append(f"Senior industry practitioner at {cand_company or 'Tech Firm'}")
            elif question_category == "Higher Studies":
                if "research" in cand_role or "phd" in cand_role:
                    score += 20
                    reasons.append(f"Academic & Research background aligned with Higher Studies")
            elif question_category == "Career Switch":
                if cand.get("alumniProfile", {}).get("experienceYears", 0) >= 3:
                    score += 15
                    reasons.append("Experienced alumnus capable of guiding career transitions")

            # 3. Active Mentor Status
            if is_mentor:
                score += 10
                reasons.append("Active verified mentor open to student engagement")

            if not reasons:
                reasons.append("Verified institutional alumnus profile")

            ranked_list.append({
                "alumniId": cand.get("id", ""),
                "fullName": cand.get("fullName", "Alumnus"),
                "currentCompany": cand_company,
                "currentRole": cand_role.title(),
                "recommendationScore": min(99, max(25, score)),
                "reasons": reasons
            })

        ranked_list.sort(key=lambda x: x["recommendationScore"], reverse=True)
        return ranked_list
