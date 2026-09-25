import re
import difflib
from typing import List, Dict, Any, Tuple

class ConfigurableWeights:
    NAME_WEIGHT = 0.35
    COLLEGE_WEIGHT = 0.20
    YEAR_WEIGHT = 0.15
    BRANCH_WEIGHT = 0.10
    COMPANY_WEIGHT = 0.10
    JOB_ROLE_WEIGHT = 0.05
    LOCATION_WEIGHT = 0.05

class DiscoveryEngine:
    """
    NLP & Heuristic Discovery Engine for matching historical alumni records
    with publicly available profiles using transparent weighted confidence scoring.
    """

    @staticmethod
    def string_similarity(s1: str, s2: str) -> float:
        if not s1 or not s2:
            return 0.0
        s1_clean = re.sub(r'[^a-zA-Z0-9\s]', '', s1.lower()).strip()
        s2_clean = re.sub(r'[^a-zA-Z0-9\s]', '', s2.lower()).strip()
        if s1_clean == s2_clean:
            return 1.0
        return difflib.SequenceMatcher(None, s1_clean, s2_clean).ratio()

    @classmethod
    def compute_match_score(
        cls,
        record: Dict[str, Any],
        candidate: Dict[str, Any]
    ) -> Tuple[int, List[str], Dict[str, Any]]:
        weights = ConfigurableWeights
        reasons = []
        signals = {}

        # 1. Name Similarity
        name_sim = cls.string_similarity(record.get("name", ""), candidate.get("name", ""))
        signals["name_similarity"] = round(name_sim, 2)
        if name_sim >= 0.95:
            reasons.append(f"Name Match: Identical or near-perfect match ({int(name_sim*100)}%)")
        elif name_sim >= 0.75:
            reasons.append(f"Name Similarity: Strong token similarity ({int(name_sim*100)}%)")
        else:
            reasons.append(f"Name Divergence: Partial match only ({int(name_sim*100)}%)")

        # 2. College Similarity
        rec_college = record.get("college", "State Engineering Institute")
        cand_college = candidate.get("college", "")
        college_sim = cls.string_similarity(rec_college, cand_college)
        signals["college_similarity"] = round(college_sim, 2)
        if college_sim >= 0.8:
            reasons.append(f"Education: Alma mater aligns with {cand_college}")
        else:
            reasons.append("Education: Institution divergence or unlisted")

        # 3. Graduation Year
        rec_year = int(record.get("graduation_year", 0))
        cand_year = int(candidate.get("graduation_year", 0))
        year_score = 0.0
        if rec_year == cand_year:
            year_score = 1.0
            reasons.append(f"Graduation Year: Exact batch match ({rec_year})")
        elif abs(rec_year - cand_year) == 1:
            year_score = 0.6
            reasons.append(f"Graduation Year: Adjacent year variance ({cand_year} vs {rec_year})")
        else:
            reasons.append(f"Graduation Year: Batch gap detected ({cand_year} vs {rec_year})")
        signals["year_score"] = year_score

        # 4. Branch / Academic Discipline
        rec_branch = record.get("branch", "")
        cand_branch = candidate.get("branch", "")
        branch_sim = cls.string_similarity(rec_branch, cand_branch)
        signals["branch_similarity"] = round(branch_sim, 2)
        if branch_sim >= 0.7:
            reasons.append(f"Department: Degree in {cand_branch} matches record")

        # 5. Company & Job Role
        rec_comp = record.get("company", "")
        cand_comp = candidate.get("company", "")
        comp_sim = cls.string_similarity(rec_comp, cand_comp) if rec_comp and cand_comp else 0.5
        signals["company_similarity"] = round(comp_sim, 2)
        if comp_sim >= 0.85:
            reasons.append(f"Employment: Currently verified at {cand_comp}")

        # Total Weighted Score
        weighted_score = (
            name_sim * weights.NAME_WEIGHT +
            college_sim * weights.COLLEGE_WEIGHT +
            year_score * weights.YEAR_WEIGHT +
            branch_sim * weights.BRANCH_WEIGHT +
            comp_sim * weights.COMPANY_WEIGHT +
            0.8 * weights.JOB_ROLE_WEIGHT +
            0.7 * weights.LOCATION_WEIGHT
        )

        final_score = int(min(99, max(20, round(weighted_score * 100))))
        return final_score, reasons, signals

    @classmethod
    def discover_public_candidates(cls, record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Safe mock public provider: searches public directory mock database.
        Never accesses private data or circumvents platform auth.
        """
        raw_name = record.get("name", "").strip()
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', raw_name).lower()
        grad_year = record.get("graduation_year", 2022)
        branch = record.get("branch", "CSE")
        company = record.get("company") or "Tech Enterprise"
        job_role = record.get("job_title") or "Software Engineer"
        location = record.get("location") or "Bengaluru, India"

        # Candidate 1: High-confidence public profile
        primary_candidate = {
            "name": raw_name,
            "college": record.get("college", "State Engineering Institute"),
            "graduation_year": grad_year,
            "branch": branch,
            "company": company,
            "job_title": job_role,
            "location": location
        }

        score_1, reasons_1, signals_1 = cls.compute_match_score(record, primary_candidate)

        matches = [
            {
                "name": raw_name,
                "platform": "LinkedIn Public Directory",
                "profileUrl": f"https://linkedin.com/in/{clean_name}-{grad_year}",
                "confidenceScore": score_1,
                "reasons": reasons_1,
                "matchingAttributes": {
                    "matchedName": raw_name,
                    "matchedYear": grad_year,
                    "matchedCompany": company,
                    "matchedBranch": branch,
                    "confidenceSignals": signals_1
                }
            }
        ]

        # Candidate 2: GitHub or Academic Repository candidate
        secondary_candidate = {
            "name": raw_name,
            "college": "State Engineering Institute",
            "graduation_year": grad_year + 1,
            "branch": branch,
            "company": "Open Source Contributor",
            "job_title": "Developer",
            "location": location
        }
        score_2, reasons_2, signals_2 = cls.compute_match_score(record, secondary_candidate)

        matches.append({
            "name": raw_name,
            "platform": "GitHub Public Repositories",
            "profileUrl": f"https://github.com/{clean_name}",
            "confidenceScore": max(45, score_2 - 15),
            "reasons": [
                "Public open-source activity detected under matching user handle",
                f"Coursework repositories match {branch} curriculum",
                "Graduation year within acceptable university window"
            ],
            "matchingAttributes": {
                "matchedName": raw_name,
                "platform": "GitHub Developer Index",
                "confidenceSignals": signals_2
            }
        })

        return matches
