
const fs = require("fs");
const path = require('path');
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const { response, json } = require('express');
const Job = require('../models/jobModel');
const Resume = require('../models/resumeModel');
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
require("dotenv").config();

const auth = async (req, res) => {
    const { user } = req.user;
    res.send({ status: 200, user, message: "Welcome User" });
}

const getResumes = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(resumes);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, });
    }
}

pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, "../node_modules/pdfjs-dist/legacy/build/pdf.worker.js");

async function extractTextFromBuffer(buffer) {
    const uint8 = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8 });
    const pdf = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it) => it.str);
        fullText += strings.join(" ") + "\n\n";
    }
    return fullText.trim();
}

function safeJsonParse(aiResponse) {
    const cleaned = aiResponse.replace(/```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
}

const analyzeResume = async (req, res) => {
    try {
        const { user } = req.user;
        const { jobId } = req.body;
        const job = await Job.findById(jobId);
        console.log("PDF uploaded:", req.files.resume.name);
        // PDF flow
        const pdfBuffer = req.files.resume.data;
        const resumeText = await extractTextFromBuffer(pdfBuffer);
        console.log(resumeText);
        const prompt = `
            You are a resume–job matching and analysis engine.
            You will be given:
            1) Resume text
            2) A Job object in JSON containing: companyName, position, description, and status

            Analyze the resume text and match it specifically against the provided job.
            RETURN ONLY VALID JSON.
            Do NOT include explanations, markdown, comments, or extra text.
            Return JSON in exactly this structure without markdown fences:
            {
                "resumeScore": number,
                "atsScore": number,
                "jobMatchPercentage": number,
                "missingSkills": ["string", "string", ...],
                "suggestions": ["string", "string", ...],
                "correctedVersion": "string"
            }

            Rules:
            - "resumeScore" must be between 0 and 100 and represent overall resume quality
            - "atsScore" must be between 0 and 100 and represent ATS compatibility
            - "jobMatchPercentage" must be between 0 and 100 and represent how well the resume matches the provided job description
            - "missingSkills" must list key skills required by the provided job description that are missing or weak in the resume
            - "suggestions" must be short, clear, actionable bullet-point improvements tailored to the provided job
            - "correctedVersion" must be a clean, professionally rewritten, ATS-optimized version of the resume tailored to the provided job
            - Do NOT escape newlines manually — return valid JSON automatically
            - Do NOT return anything outside the JSON object

            Input:
            {
                "resumeText": """
                ${resumeText}
                """,
                "job": {
                    "companyName": "${job.company}",
                    "position": "${job.position}",
                    "description": """
                    ${job.description}
                    """,
                    "status": "open"
                }
            }
        `;
        console.log(prompt);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        console.log(response.text);
        const aiData = safeJsonParse(response.text);
        console.log(aiData);
        const newResume = new Resume({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            originalText: resumeText,
            aiImprovedText: aiData.correctedVersion,
            aiScore: aiData.resumeScore,
            atsScore: aiData.atsScore,
            jobMatchPercentage: aiData.jobMatchPercentage,
            missingSkills: aiData.missingSkills,
            suggestions: aiData.suggestions
        });
        console.log(newResume.aiImprovedText);
        await newResume.save();
        res.status(200).send({ status: 200, newResume, message: "Response generated successfully" });
    } catch (err) {
        res.status(500).json({ status: 500, success: false, message: "Internal Server Error", });
    }
}

const downloadResume = async (req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: "No content provided" });
    }

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=professional-summary.txt"
    );
    res.setHeader("Content-Type", "text/plain");

    res.send(content);
}

const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResume = await Resume.findByIdAndDelete(id);
        res.status(200).json({ message: "Resume deleted successfully", deletedResume });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const clearAllHistory = async (req, res) => {
    try {
        const { user } = req.user;
        await Resume.deleteMany({ userId: user.id });
        res.status(200).json({ message: "Resume history has been successfully deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { getResumes, analyzeResume, downloadResume, deleteResume, clearAllHistory, auth };
