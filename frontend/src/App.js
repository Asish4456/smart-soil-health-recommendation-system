import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import HeroSection from "./components/HeroSection.js";
import SoilForm from "./components/SoilForm.js";
import ReportCard from "./components/ReportCard.js";
import StatsCounter from "./components/StatsCounter.js";
import ScrollAnimations from "./components/ScrollAnimations.js";
import ChatBubble from "./components/ChatBubble.js";
import "./App.css";

function App() {
  const [records, setRecords] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/soil/all`);
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 3 + Math.random() * 5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      color: ["#a5d6a7", "#c8e6c9", "#fff9c4", "#ffe0b2"][Math.floor(Math.random() * 4)],
    }));
  }, []);

  return (
    <div className="app">
      <ScrollAnimations />

      {/* Floating particles */}
      <div className="particles-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <HeroSection />

      <StatsCounter recordsCount={records.length} />

      <SoilForm onRecordAdded={fetchData} />

      <section className="report-cards-section" id="reports">
        <h2 className="report-cards-title">📊 Soil Reports</h2>
        {records.length === 0 ? (
          <p style={{ textAlign: "center", color: "#81c784", fontStyle: "italic" }}>
            No reports yet. Analyze your first soil sample above!
          </p>
        ) : (
          records.map((item, index) => (
            <ReportCard key={item._id} item={item} index={index} />
          ))
        )}
      </section>

      <ChatBubble />
    </div>
  );
}

export default App;
