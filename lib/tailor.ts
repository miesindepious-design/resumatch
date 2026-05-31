import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface TailorResult {
  tailoredResume: string
  coverLetter: string
  matchScore: number
  missingKeywords: string[]
  improvements: string[]
}

export interface LinkedInOptimizationResult {
  headline: string
  about: string
  experience: Array<{ role: string; company: string; optimized: string }>
  skills: string[]
  tips: string[]
}

export async function tailorResume(
  originalResume: string,
  jobDescription: string
): Promise<TailorResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  
  const prompt = `You are an expert career coach and resume writer. Your task is to tailor a candidate's resume to a specific job description.

RULES:
- NEVER fabricate experience, skills, or qualifications the candidate doesn't have
- Preserve the candidate's authentic voice and all real experience
- Reorder, reframe, and emphasize existing experience to match the job
- Use keywords from the job description naturally where truthful
- Make bullet points achievement-oriented and quantified where possible
- Keep the same overall structure but optimize the language

ORIGINAL RESUME:
${originalResume}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with a JSON object in this exact format (no markdown, no backticks):
{
  "tailoredResume": "The full tailored resume text with clear sections. Use \\n for line breaks.",
  "coverLetter": "A compelling 3-paragraph cover letter tailored to this specific role and company.",
  "matchScore": <integer 0-100 representing how well the candidate fits this role>,
  "missingKeywords": ["keyword1", "keyword2"],
  "improvements": ["specific improvement made 1", "specific improvement made 2", "specific improvement made 3"]
}`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as TailorResult
}

export async function optimizeLinkedIn(
  resumeText: string,
  jobDescription?: string
): Promise<LinkedInOptimizationResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  
  let jobContext = jobDescription || "General professional optimization"
  
  const prompt = `You are an expert LinkedIn strategist. Your task is to optimize a LinkedIn profile based on a resume.

RULES:
- NEVER fabricate experience, skills, or qualifications the candidate doesn't have
- Preserve the candidate's authentic voice and all real experience
- Use keywords relevant to the job description (if provided)
- Make the profile engaging and keyword-rich for LinkedIn's algorithm

RESUME TEXT:
${resumeText}

JOB CONTEXT:
${jobContext}

Respond ONLY with a JSON object in this exact format (no markdown, no backticks):
{
  "headline": "Optimized LinkedIn headline (220 characters max)",
  "about": "Compelling About section (3-5 paragraphs, use \\n for line breaks)",
  "experience": [
    { "role": "Role name from resume", "company": "Company name", "optimized": "Optimized LinkedIn experience bullet points with \\n for line breaks" }
  ],
  "skills": ["skill 1", "skill 2", "skill 3"],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as LinkedInOptimizationResult
}
