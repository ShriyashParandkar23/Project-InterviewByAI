// src/App.jsx
import { useState } from "react";
import HomePage from './pages/HomePage';
import MeetingPage from "./pages/MeetingPage";
import { Routes,Route } from "react-router-dom";

export default function App() {
  return (
<>
  <Routes>
<Route path="/" element={<HomePage />} />
<Route path="/meeting" element={<MeetingPage />} />
  </Routes>
  {/* <SpeechToTextWithPause /> */}

  {/* <TTSPlayer /> */}
</>
  );
}
