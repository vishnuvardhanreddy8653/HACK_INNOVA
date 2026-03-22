from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, qr, vote, alerts, auth_final, admin

# Fully Re-Triggering hot reload to consume Twilio Sandbox Number (+13186071745)
app = FastAPI(title="Voting App Gateway")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(qr.router, prefix="/verify", tags=["qr"])
app.include_router(auth_final.router, prefix="/final-verify", tags=["final"])
app.include_router(vote.router, prefix="/vote", tags=["vote"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Voting App API is running"}
