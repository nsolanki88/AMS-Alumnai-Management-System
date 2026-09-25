import re
from typing import List, Tuple

class DoubtClassifier:
    """
    Classifies student doubts into structured categories:
    - Interview Preparation
    - Higher Studies
    - Career Switch
    - Technical
    - Career Guidance
    - Other
    And extracts relevant technical and domain skill tags.
    """

    SKILLS_VOCABULARY = [
        "python", "react", "node.js", "nodejs", "javascript", "typescript",
        "java", "c++", "golang", "go", "aws", "azure", "docker", "kubernetes",
        "system design", "distributed systems", "microservices", "machine learning",
        "deep learning", "nlp", "computer vision", "sql", "postgresql", "mongodb",
        "devops", "ci/cd", "algorithms", "dsa", "data structures", "cloud",
        "cybersecurity", "embedded systems", "vlsi", "robotics", "iot",
        "gre", "gate", "cat", "masters", "phd", "ielts", "toefl", "scholarship",
        "resume", "placement", "interview", "mock interview", "hr round"
    ]

    CATEGORY_KEYWORDS = {
        "Interview Preparation": [
            "interview", "coding round", "online assessment", "oa", "hr round",
            "mock", "system design interview", "dsa", "leetcode", "resume review",
            "placement", "campus placement", "salary negotiation"
        ],
        "Higher Studies": [
            "gre", "gate", "ms", "masters", "phd", "higher studies", "toefl",
            "ielts", "sop", "lor", "admissions", "scholarship", "university abroad"
        ],
        "Career Switch": [
            "career switch", "transition", "non-tech to tech", "changing domain",
            "switching from", "moving to product", "service to product"
        ],
        "Technical": [
            "bug", "architecture", "framework", "syntax", "api", "database query",
            "concurrency", "performance", "async", "dockerfile", "pipeline error",
            "code optimization", "react hook", "memory leak"
        ],
        "Career Guidance": [
            "roadmap", "how to start", "career advice", "guidance", "which field",
            "future scope", "work life balance", "mentorship", "industry trends"
        ]
    }

    @classmethod
    def classify_and_extract(cls, title: str, description: str) -> Tuple[str, List[str], float]:
        text = f"{title} {description}".lower()

        # 1. Extract Skills
        extracted = []
        for skill in cls.SKILLS_VOCABULARY:
            # Word boundary check
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text):
                clean_tag = skill.title()
                if clean_tag not in extracted:
                    extracted.append(clean_tag)

        # 2. Classify Category based on keyword density
        scores = {}
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            score = 0
            for kw in keywords:
                if kw in text:
                    score += 2 if kw in title.lower() else 1
            scores[category] = score

        best_category = max(scores, key=scores.get)
        confidence = 0.85
        if scores[best_category] == 0:
            best_category = "Career Guidance"
            confidence = 0.70
        else:
            confidence = min(0.98, 0.75 + (scores[best_category] * 0.05))

        if not extracted:
            extracted = ["General Engineering"]

        return best_category, extracted, round(confidence, 2)
