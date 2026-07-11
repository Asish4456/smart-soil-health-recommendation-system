import React from "react";
import { motion } from "framer-motion";
import "./HeroSection.css";

const HERO_VIDEO = "https://videos.pexels.com/video-files/26655286/11985467_2560_1440_30fps.mp4";

const letterVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.5, ease: "easeOut" },
  }),
};

const HeroSection = () => {
  const titleText = "Smart Soil Health System";

  const handleScroll = () => {
    document.getElementById("soil-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" id="hero">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.pexels.com/photos/26655286/pexels-photo-26655286.jpeg?auto=compress&cs=tinysrgb&w=1920"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div className="hero-overlay" />

      <div className="hero-content">
        <motion.h1
          className="hero-title"
          initial="hidden"
          animate="visible"
          style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}
        >
          {titleText.split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          Analyze. Understand. Grow.
        </motion.p>

        <motion.button
          className="hero-scroll-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          onClick={handleScroll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
          <span className="scroll-arrow">↓</span>
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
