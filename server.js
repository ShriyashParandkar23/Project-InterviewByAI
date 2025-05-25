const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const { Server } = require("socket.io");
const axios = require("axios");
const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const userSessions = new Map();

io.on("connection", (socket) => {
  userSessions.set(socket.id, {
    oldChats: [],
    resumeFile: null,
    jobDescription: "",
    interviewOverview: "",
  });
  console.log("User connected:", socket.id);

  // ✅ Handle resume and job description upload

  //  ==================

  socket.on("upload-data", ({ resume, jobDescription }) => {
    const buffer = Buffer.from(resume.data);

    // Save file (optional)
    fs.writeFile(`uploads/${resume.name}`, buffer, (err) => {
      if (err) return console.error("Error saving resume:", err);
      console.log("✅ Resume saved:", resume.name);
    });

    const session = userSessions.get(socket.id);
    session.resumeFile = resume;
    session.jobDescription = jobDescription;
    session.oldChats.push({
      role: "user",
      content: `This is my Resume ${resume} & This is job profile ${jobDescription}`,
    });

    console.log("Received resume:", session?.resume?.name);
    console.log(
      "Received job description length:",
      session?.jobDescription?.length
    );
    console.log("Job Description:", session?.jobDescription);
  });

  socket.on("start-interview", async (data) => {
    const session = userSessions.get(socket.id);
    const candidateAns = data?.candidateAns || "";
    const systemPrompt = `
                            You are an AI interviewer conducting a professional, real-time, structured technical interview with a software developer candidate.

                            - Resume file: ${session?.resumeFile?.name}
                            - Job description: ${session?.jobDescription}
                            - Previous conversation: ${session?.oldChats}

                            **Instructions for Interview Flow:**

                            1. Begin with a brief introduction—ask the candidate to introduce themselves.
                            2. Discuss relevant parts of the resume to understand their experience and background.
                            3. Ask targeted technical questions based on the overlap between the candidate's resume and the job description.
                            4. All questions must be **relevant to the job role and technical expertise** required. No unrelated or off-topic questions.
                            5. Maintain a serious, professional tone—friendly but not casual.
                            6. Do not allow the conversation to divert. If the candidate goes off-topic or asks for answers, give a strict warning to stay on track.
                            7. The interview should be **entirely AI-driven**. You are not allowed to reveal answers, hints, or explanations during the interview.
                            8. After each candidate response, return a JSON object like:

                            \`\`\`json
                            {
                              "ai_interviewer": "Your message here",
                              "lastquestion_rating": 78,
                              "interview": true
                            }
                            \`\`\`

                            - The rating (0–100) should be based on **accuracy** and **depth of understanding** demonstrated in the candidate's response.
                            - If the candidate fails to answer properly **3 to 5 times**, end the interview with:

                            \`\`\`json
                            {
                              "ai_interviewer": "Your closing message here",
                              "lastquestion_rating": XX,
                              "interview": false
                            }
                            \`\`\`

                            **Keep every message crisp, focused, and professional.**
                            Your goal is to simulate a **real technical interview** for a software development role.

                            Rules: 
                            ⚠️ IMPORTANT: Always respond **only** with a valid JSON object. Do not include any plain text or explanations outside of the JSON. Your response must strictly be:

                            """json
                            {
                              "ai_interviewer": "Your message here",
                              "lastquestion_rating": 75,
                              "interview": true
                            }"""
`;
    let ans = "";

//  for chat completion and audio generation
    try {
      const res = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: candidateAns },
        ],
      });

      ans = res.choices[0].message.content;

      console.log("AI response:", ans);
      parsed_output = JSON.parse(ans);
      const ai_ans = parsed_output?.ai_interviewer;
      console.log("\n\n\n", ai_ans);

      const voiceRes = await axios({
        method: "POST",
        url: "https://api.openai.com/v1/audio/speech",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        data: {
          model: "tts-1",
          input: ai_ans,
          voice: "nova",
        },
      });
      const base64Audio = Buffer.from(voiceRes.data, "binary").toString(
        "base64"
      );
      console.log("\n\naudio sent to client");
      socket.emit("ai-audio-data", { audio: base64Audio });

      if (candidateAns) {
        session?.oldChats.push({
          role: "user",
          content: candidateAns,
        });
      }

      session?.oldChats.push({
        role: "assistant",
        content: ans,
      });

      socket.emit("start-interview", ans);
    } catch (error) {
      console.error("Error in start-interview:", error);
      return socket.emit("error", "Failed to start interview");
    }

    try {
      const parsedAns = JSON.parse(ans);
      if (parsedAns.interview == false) {
        const finalSystemPrompt = `
                                    You are an AI interviewer conducting a professional, real-time, structured technical interview with a software developer candidate.

                                    This is the full transcript of the interview: ${session?.oldChats
                                      ?.map(
                                        (chat) =>
                                          `${
                                            chat.role === "user"
                                              ? "Candidate"
                                              : "AI"
                                          }: ${chat.content}`
                                      )
                                      .join("\n")}


                                    Your task is to analyze the entire interview and provide a comprehensive final outcome.

                                    **Instructions:**

                                    1. Evaluate the candidate's overall performance based on the accuracy, depth of understanding, communication clarity, problem-solving approach, and relevance of their responses.
                                    2. Provide detailed feedback on the candidate's strengths and areas for improvement.
                                    3. Provide individual ratings (0–100) for relevant skill categories.
                                    4. Offer a final overall rating (0–100) summarizing their interview performance.
                                    5. Clearly state whether the candidate is recommended for the next stage (yes/no).
                                    6. Suggest any appropriate next steps for the candidate.

                                    **Return a JSON object in the following format:**

                                    """json
                                    {
                                      "overall_rating": 85,
                                      "skill_ratings": {
                                        "technical_knowledge": 80,
                                        "problem_solving": 78,
                                        "communication": 90
                                      },
                                      "strengths": "Clearly explained concepts with real-world examples. Excellent communication.",
                                      "areas_for_improvement": "Needs more depth in algorithm design and time complexity analysis.",
                                      "recommendation": "yes",
                                      "next_steps": "Proceed to system design interview.",
                                      "final_feedback": "The candidate demonstrated strong fundamentals and excellent communication. However, they should improve on deeper algorithmic thinking. Overall, a promising candidate for the next round."
                                    }
                                    
                                    Rule:
                                    ⚠️ IMPORTANT: Always respond **only** with a valid JSON object. Do not include any plain text or explanations outside of the JSON. 
                                    """
                                    `;
        const finalRes = await client.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: "give me final result of my interview" },
          ],
        });

        const overview = finalRes.choices[0].message.content;
        console.log("Final response:", overview);
        session.interviewOverview = overview;
        return socket.emit("final-feedback", overview);
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return socket.emit("error", "Invalid response from AI");
    }
  });

  socket.on("disconnect", () => {
    userSessions.delete(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});
