from fastapi import APIRouter, HTTPException
from app.schemas.schemas import ChatIntentRequest, ChatIntentResponse
from app.services.chatbot_nlp import ChatbotNLP

router = APIRouter(prefix="/ai", tags=["Chatbot NLP"])

@router.post("/chat-intent", response_model=ChatIntentResponse)
def get_chat_intent(request: ChatIntentRequest):
    try:
        intent, entities, confidence = ChatbotNLP.parse_query(
            request.query, request.user_role
        )
        return {
            "intent": intent,
            "entities": entities,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
