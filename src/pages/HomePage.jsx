import React from "react";
import FeatureCard from "../components/keyFeatures/FeatureCard";
import PricingCard from "../components/pricingCard/PricingCard";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from 'react-router-dom';

const HomePage = () => {
    
  return (
    <div className="dark bg-black min-h-screen text-white font-sans">
      {/* Navbar */}
      <Navbar/>
    
      <header className="h-screen bg-radial from-[#09004f] from-10% to-black flex flex-col justify-center items-center px-4 text-center pt-16 text-white relative overflow-hidden">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 max-w-3xl">
          Redefining Interviews with Real-Time AI Intelligence
        </h1>
        <p className="text-lg max-w-xl mb-8">
          Automate and revolutionize your hiring process with AI-powered
          interview solutions tailored for founders and recruiters.
        </p>
        <Link to="/meeting">
        <button className="bg-blue-600  hover:bg-blue-700 hover:border-white  hover:border px-6 py-3 rounded-md text-white font-semibold transition">
          Try Interview Now
        </button>
        </Link>
      </header>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-16 space-y-12"
      >
        <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <FeatureCard
            heading="AI-Powered Insights"
            text="Get instant feedback and analysis on candidate responses to make informed decisions."
          />
          <FeatureCard
            heading="AI-Powered Feedback"
            text="Receive actionable interview feedback and suggestions from our intelligent AI interviewer."
          />
          <FeatureCard
            heading="Seamless Video Interview"
            text="Engage with candidates via a smooth video interface integrated with real-time AI analytics."
          />
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-16 px-6  text-[#ffffff] "
        style={{
          background:
            "linear-gradient(to bottom, #000000 , #0900427f , #000000 )",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <h2 className="text-4xl font-bold mb-6">How It Works</h2>
          <ol className="list-decimal list-inside space-y-4 text-lg">
            <li>Sign up and set up your company profile.</li>
            <li>Schedule interviews and invite candidates.</li>
            <li>
              Conduct AI-assisted interviews with live speech transcription.
            </li>
            <li>Get instant AI-generated feedback and insights.</li>
            <li>Make faster and more informed hiring decisions.</li>
          </ol>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <h2 className="text-4xl font-bold text-center mb-12">Pricing Plans</h2>
        <div className="grid gap-8 sm:grid-cols-3">

          <PricingCard
            title="Basic"
            description="Perfect for startups getting started with AI interviews."
            price="19"
            highlighted={false}
          />
          <PricingCard
            title="Enterprise"
            description="Advanced features for growing teams and founders."
            price="49"
            highlighted={true}
          />{" "}
          <PricingCard
            title="Pro"
            description="Custom solutions for large organizations."
            price="Contact Sales"
            highlighted={true}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Radison AI Interview. All rights
        reserved.
      </footer>
    </div>
  );
};

export default HomePage;
