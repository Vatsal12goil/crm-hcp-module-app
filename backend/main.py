from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import engine, Base, get_db
import models
from agent import process_chat

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-First CRM HCP Module")

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Populate test data if empty
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    if db.query(models.HCP).count() == 0:
        db.add(models.HCP(id=1, name="Dr. Gregory House", specialty="Diagnostic Medicine", location="Princeton-Plainsboro"))
        db.add(models.HCP(id=2, name="Dr. Meredith Grey", specialty="General Surgery", location="Seattle Grace"))
        db.commit()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CRM Backend is running"}

@app.get("/api/hcps", response_model=List[models.HCPResponse])
def get_hcps(db: Session = Depends(get_db)):
    return db.query(models.HCP).all()

@app.get("/api/interactions", response_model=List[models.InteractionResponse])
def get_interactions(db: Session = Depends(get_db)):
    return db.query(models.Interaction).order_by(models.Interaction.date.desc()).all()

@app.post("/api/interactions", response_model=models.InteractionResponse)
def create_interaction(interaction: models.InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = models.Interaction(**interaction.dict())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.put("/api/interactions/{interaction_id}", response_model=models.InteractionResponse)
def update_interaction(interaction_id: int, interaction: models.InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
        
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.post("/api/chat")
def chat_with_agent(payload: Dict[str, Any] = Body(...)):
    message = payload.get("message", "")
    history = payload.get("history", [])
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    reply = process_chat(message, history)
    return {"reply": reply}

