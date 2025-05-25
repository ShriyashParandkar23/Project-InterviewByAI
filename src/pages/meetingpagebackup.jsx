import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

// Create a socket connection to the backend server
const socket = io("http://localhost:8000");

export default function MeetingPage() {
  // === State Definitions ===
  const [transcripts, setTranscripts] = useState([]); // Stores the conversation transcript (AI + User)
  const [textarea, setTextarea] = useState(""); // Stores the user's typed answer
  const transcriptEndRef = useRef(null); // Ref for auto-scrolling to the latest transcript entry
  const [resumeFile, setResumeFile] = useState(null); // Stores the uploaded resume file
  const [jobDescription, setJobDescription] = useState(
    "good at react understanding of states and redux management and components if student then reject"
  ); // Stores the job description
  const [isSubmitted, setIsSubmitted] = useState(false); // Tracks if resume & JD are submitted
  const [isInterviewStarted, setIsInterviewStarted] = useState(false); // Tracks if interview is ongoing
  const [isInterviewOver, setIsInterviewOver] = useState(false); // Tracks if interview is completed
  const [dummyOverview, setDummyOverview] = useState(null); // Stores the final interview feedback from server
  const [isOverviewLoading, setIsOverviewLoading] = useState(false); // Shows loading state while waiting for final feedback

  // === Function: Handle resume upload ===
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file); // Accepts only PDF files
    } else {
      alert("Please upload a valid PDF file.");
      e.target.value = null; // Reset file input if not valid
    }
  };

  // === Function: Submit resume and job description to the backend ===
  const handleSubmit = () => {
    if (!resumeFile || !jobDescription.trim()) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      socket.emit("upload-data", {
        resume: {
          name: resumeFile.name,
          type: resumeFile.type,
          data: Array.from(new Uint8Array(arrayBuffer)), // Convert PDF to byte array
        },
        jobDescription,
      });
      setIsSubmitted(true);
    };
    reader.readAsArrayBuffer(resumeFile);
  };

  // === Function: Start the interview by emitting socket event ===
  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    socket.emit("start-interview"); // Tells server to start the interview
  };

  // === Function: Send user's typed answer to backend and update transcript ===
  const handleme = () => {
    if (!textarea.trim()) return;

    socket.emit("start-interview", { candidateAns: textarea }); // Send answer to server
    setTranscripts((prev) => [...prev, { speaker: "You", text: textarea }]); // Add user response to transcript
    setTextarea(""); // Clear textarea
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Auto-scroll to latest entry
  };

  // === useEffect: Listen for AI response and final feedback from server ===
  useEffect(() => {
    // Handle AI response from server
    const handleAIResponse = (data) => {
      try {
        const ai_response = JSON.parse(data);
        const ai_answer = ai_response?.ai_interviewer;
        const interview_status = ai_response?.interview;

        if (!interview_status) {
          setIsOverviewLoading(true); // Interview is ending, wait for feedback
        }

        // Add AI response to transcript
        setTranscripts((prev) => [
          ...prev,
          { speaker: "AI Assistant", text: ai_answer },
        ]);
      } catch (e) {
        console.error("Error parsing AI response:", e);
        console.log("Raw response:", data);
      }
    };

    // Listen for AI question/response
    socket.on("start-interview", handleAIResponse);

    // Listen for final feedback after interview is over
    socket.on("final-feedback", (overview) => {
      try {
        const parsedOverview =
          typeof overview === "string" ? JSON.parse(overview) : overview;
        setDummyOverview(parsedOverview); // Save final feedback
      } catch (e) {
        console.error("Error parsing final feedback overview:", e);
        setDummyOverview(null);
      }
      setIsOverviewLoading(false);
      setIsInterviewStarted(false);
      setIsInterviewOver(true); // Show feedback modal
    });

    // Cleanup event listeners on unmount
    return () => {
      socket.off("start-interview", handleAIResponse);
      socket.off("final-feedback");
    };
  }, []);

 
  return (
    <>
      <Navbar />
      <section
        className="min-h-screen px-6 py-12 pt-20 text-white relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at left center, #0900427f 0%, #000000 70%), radial-gradient(circle at right center, #0900427f 0%, #000000 70%)",
          backgroundColor: "#000000",
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Resume and JD upload */}
          {!isSubmitted && (
            <div className="md:col-span-12 mt-8 bg-[#0a0a0a] rounded-md p-6 shadow-lg border border-[#ffffff1e]">
              <h3 className="text-xl font-bold mb-4 text-white">
                Interview Preparation Tools
              </h3>
              <div className="mb-6">
                <label className="block mb-2 text-gray-300 font-semibold">
                  Upload Resume (PDF Only):
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
                />
                {resumeFile && (
                  <p className="mt-2 text-green-400">
                    Uploaded: {resumeFile.name}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-gray-300 font-semibold">
                  Paste Job Description:
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded-md bg-[#111111] text-white border border-[#ffffff1e] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-blue-400 text-sm">select jobs from our site..</p>
                <button
                  onClick={handleSubmit}
                  disabled={!resumeFile || !jobDescription.trim()}
                  className={`px-6 py-3 rounded-md text-white font-semibold transition ${
                    !resumeFile || !jobDescription.trim()
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Resume + JD summary after submit */}
          {isSubmitted && (
            <div className="md:col-span-12 mt-8 bg-[#0a0a0a] rounded-md p-4 flex gap-5 shadow-lg border border-[#ffffff1e]">
              <p className="text-green-400 text-sm">
                Uploaded: {resumeFile?.name}
              </p>
              <p className="text-green-400 text-sm">
                Job Description: {jobDescription.slice(0, 20)}...
              </p>
            </div>
          )}

          {/* Video and interaction panel */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#111111] rounded-md overflow-hidden shadow-lg h-[200px] sm:h-[400px] md:h-[500px] border border-[#ffffff1e]">
                <div className="p-2 bg-blue-900 text-center text-sm font-semibold">
                  Candidate
                </div>
                <video className="w-full h-full object-cover" autoPlay muted />
              </div>
              <div className="bg-[#111111] rounded-md overflow-hidden shadow-lg h-[200px] sm:h-[400px] md:h-[500px] border border-[#ffffff1e]">
                <div className="p-2 bg-blue-900 text-center text-sm font-semibold">
                  AI Assistant
                </div>
                <video className="w-full h-full object-cover" autoPlay muted />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              {isInterviewStarted ? (
                <>
                  <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-md text-white font-semibold transition">
                    End Call
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-white font-semibold transition">
                    Answer Now
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartInterview}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md text-white font-semibold transition"
                >
                  Start Call
                </button>
              )}
              <input
                type="text"
                onChange={(e) => setTextarea(e.target.value)}
                value={textarea}
                className="bg-gray-200 text-black px-2 py-1 rounded-md"
                placeholder="Type your answer..."
              />
              <button
                onClick={handleme}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Submit Answer
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="md:col-span-4 bg-[#0a0a0a] rounded-md p-4 shadow-lg h-full max-h-[60vh] overflow-hidden border border-[#ffffff1e]">
            <div className="sticky top-0 bg-[#0a0a0a] z-10 pb-2">
              <h3 className="text-xl font-bold">Live Transcript</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(60vh-3rem)] space-y-3 text-sm leading-relaxed pr-1">
              {transcripts.map((entry, index) => (
                <div key={index}>
                  <span
                    className={`font-semibold ${
                      entry.speaker === "You"
                        ? "text-purple-400"
                        : "text-blue-400"
                    }`}
                  >
                    {entry.speaker}:
                  </span>
                  <span className="ml-2 text-gray-300">{entry.text}</span>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* Interview Result Modal */}
     {isInterviewOver && !isOverviewLoading && dummyOverview && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-white text-black rounded-2xl shadow-2xl p-8 w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Interview Overview
      </h2>

      <div className="space-y-4">
        <div>
          <p className="font-semibold text-lg">Overall Rating:</p>
          <p className="text-2xl font-extrabold text-blue-600">
            {dummyOverview?.overall_rating ?? "N/A"} / 50
          </p>
        </div>

        {dummyOverview?.skill_ratings && (
          <div>
            <p className="font-semibold text-lg mb-2">Skill Ratings:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-800">
              <div className="bg-gray-100 rounded-md p-4">
                <p className="text-sm text-gray-600">Technical Knowledge</p>
                <p className="font-bold text-blue-800 text-xl">
                  {dummyOverview.skill_ratings.technical_knowledge ?? "N/A"} / 50
                </p>
              </div>
              <div className="bg-gray-100 rounded-md p-4">
                <p className="text-sm text-gray-600">Problem Solving</p>
                <p className="font-bold text-blue-800 text-xl">
                  {dummyOverview.skill_ratings.problem_solving ?? "N/A"} / 50
                </p>
              </div>
              <div className="bg-gray-100 rounded-md p-4">
                <p className="text-sm text-gray-600">Communication</p>
                <p className="font-bold text-blue-800 text-xl">
                  {dummyOverview.skill_ratings.communication ?? "N/A"} / 50
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="font-semibold text-lg">Strengths:</p>
          <p className="text-green-700">{dummyOverview?.strengths ?? "N/A"}</p>
        </div>

        <div>
          <p className="font-semibold text-lg">Areas to Improve:</p>
          <p className="text-red-700">{dummyOverview?.areas_for_improvement ?? "N/A"}</p>
        </div>

        <div>
          <p className="font-semibold text-lg">Recommendation:</p>
          <p
            className={
              dummyOverview?.recommendation === "no"
                ? "text-red-600 font-bold text-xl"
                : "text-green-600 font-bold text-xl"
            }
          >
            {dummyOverview?.recommendation === "no"
              ? "Not Recommended"
              : "Recommended"}
          </p>
        </div>

        <div>
          <p className="font-semibold text-lg">Next Steps:</p>
          <p>{dummyOverview?.next_steps ?? "N/A"}</p>
        </div>

        <div>
          <p className="font-semibold text-lg">Final Feedback:</p>
          <p>{dummyOverview?.final_feedback ?? "N/A"}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsInterviewOver(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </section>
    </>
  );
}

