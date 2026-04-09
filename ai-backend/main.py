import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load environment variables and configure Gemini
load_dotenv()
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobApplicationRequest(BaseModel):
    company_name: str
    job_description: str

# 2. Define the Gemini Model and System Instructions
# This ensures the AI acts as a career assistant and doesn't hallucinate.
system_prompt = """
You are an expert career assistant. Your task is to write a highly professional, concise job application email based on the provided Job Description.
The applicant is a Software Developer specializing in full-stack web development (MERN stack, Next.js, React) and AI Engineering (NLP, LLM integrations).
Rules:
1. Highlight the applicant's matching skills.
2. Do NOT invent past job titles.
3. Keep the email under 200 words.
4. Output ONLY the email text.
"""

model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=system_prompt
)

@app.post("/api/generate-email")
async def generate_email(request: JobApplicationRequest):
    print("--> Received request. Contacting Gemini AI...")

    try:
        # 3. Create the user prompt with the actual JD
        user_prompt = f"Please draft an application email for this Job Description:\n\n{request.job_description}"
        
        # 4. Generate the response
        response = model.generate_content(user_prompt)
        ai_draft = response.text

        print("--> Gemini generation successful.")

        # 5. Return the AI text to Next.js
        return {
            "status": "success",
            "generated_email": ai_draft.strip(),
            "match_score": 88 # We keep this mocked for now
        }
        
    except Exception as e:
        print(f"Error connecting to Gemini: {e}")
        return {"status": "error", "message": "Failed to generate email"}