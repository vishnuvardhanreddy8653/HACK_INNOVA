from fastapi import FastAPI
from app.api.routes import auth, qr, vote, alerts

app = FastAPI(title="Voting App Gateway")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(qr.router, prefix="/verify", tags=["qr"])
app.include_router(vote.router, prefix="/vote", tags=["vote"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

@app.get("/")
def read_root():
    return {"message": "Voting App API is running"}
