# AMS+ AI Matching & NLP Engine Documentation

## Core Capabilities
The AMS+ AI microservice (built with Python & FastAPI, with deterministic fallback in Node.js) provides 5 core capabilities:
1. **Public Profile Discovery**: Heuristic token-matching against public directories with transparent weighted scoring.
2. **Confidence Scoring**: Explainable numerical score (0-100%) accompanied by rationale statements.
3. **Question Classification**: NLP classifier categorizing student doubts into 6 standard categories.
4. **Alumni Recommendation Ranking**: Multi-attribute ranking matching questions to verified alumni profiles.
5. **Chatbot NLP Engine**: Natural language intent resolution and entity extraction enforcing Role-Based Access Control.

## Weighted Confidence Scoring Formula
Discovery confidence is calculated using configurable weights:
- **Name Similarity**: 35% weight (exact match: 1.0, token set ratio: 0.75-0.95)
- **Alma Mater / College Match**: 20% weight
- **Graduation Year / Batch**: 15% weight (exact match: 1.0, +/- 1 year: 0.6)
- **Academic Branch**: 10% weight
- **Company / Current Organization**: 10% weight
- **Job Role Designation**: 5% weight
- **Location Alignment**: 5% weight

## Privacy & Compliance Mandates
- **Public Data Only**: The discovery provider accesses strictly public profile metadata and never private social feeds or gated credentials.
- **No Automatic Linkage**: Discovered candidate profiles are tagged as `pending` and **NEVER** automatically verified. Human verification by Council/Admin is mandatory before linking to official records.
- **Chatbot RBAC Enforcement**: Students and Faculty querying the chatbot are blocked from discovering unverified or candidate match records.
