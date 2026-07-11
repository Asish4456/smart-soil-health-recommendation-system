import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./ScrollAnimations.css";

const LEAF_SVG = "🍂";
const LEAF_SVG2 = "🍃";

const ScrollAnimations = () => {
  const cursorRef = useRef(null);
  const { scrollY } = useScroll();
  const [leaves, setLeaves] = useState([]);
  const lastScrollRef = useRef(0);
  const lastMouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  // Cursor leaf trail - use direct DOM manipulation instead of state
  useEffect(() => {
    const handleMouseMove = (e) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current && !rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${lastMouseRef.current.x - 10}px, ${lastMouseRef.current.y - 10}px)`;
          }
          rafRef.current = null;
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Falling leaves on scroll - throttle with RAF
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const diff = Math.abs(latest - lastScrollRef.current);
      lastScrollRef.current = latest;
      if (latest > 300 && diff > 20 && Math.random() > 0.85) {
        setLeaves((prev) => {
          if (prev.length >= 5) return prev;
          return [
            ...prev,
            {
              id: Date.now() + Math.random(),
              x: Math.random() * window.innerWidth,
              emoji: Math.random() > 0.5 ? LEAF_SVG : LEAF_SVG2,
              rotation: Math.random() * 360,
              duration: 3 + Math.random() * 2,
              size: 18 + Math.random() * 12,
            },
          ];
        });
      }
    });
    return unsubscribe;
  }, [scrollY]);

  // Clean up leaves
  useEffect(() => {
    const timer = setInterval(() => {
      setLeaves((prev) => (prev.length > 3 ? prev.slice(-3) : prev));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Earthworm visibility
  const wormOpacity = useTransform(scrollY, [500, 800], [0, 1]);
  const wormY = useTransform(scrollY, [500, 900], [100, 0]);

  return (
    <>
      {/* Falling leaves */}
      <div className="scroll-animations">
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            className="falling-leaf"
            style={{ left: leaf.x, fontSize: leaf.size }}
            initial={{ y: -30, opacity: 1, rotate: 0 }}
            animate={{
              y: window.innerHeight + 30,
              opacity: [1, 1, 0],
              rotate: leaf.rotation,
              x: [0, 30, -20, 40, 0],
            }}
            transition={{ duration: leaf.duration, ease: "easeIn" }}
          >
            {leaf.emoji}
          </motion.div>
        ))}
      </div>

      {/* Cursor leaf trail */}
      <div ref={cursorRef} className="cursor-leaf">
        🌿
      </div>

      {/* Earthworm */}
      <motion.div
        className="earthworm-container"
        style={{ opacity: wormOpacity, y: wormY }}
      >
        <svg className="earthworm-svg" viewBox="0 0 60 120">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.ellipse
              key={i}
              cx="30"
              cy={15 + i * 18}
              rx={12 - Math.abs(i - 2.5) * 1.5}
              ry="10"
              className="earthworm-segment"
              animate={{
                cx: [30, 35, 25, 30],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
          <circle cx="26" cy="12" r="2" fill="#333" />
          <circle cx="34" cy="12" r="2" fill="#333" />
        </svg>
      </motion.div>
    </>
  );
};

export default ScrollAnimations;
