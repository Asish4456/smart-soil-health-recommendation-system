import React, { useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./ReportCard.css";

const getHealthClass = (status) => {
  if (status?.includes("Excellent")) return "health-excellent";
  if (status?.includes("Moderate")) return "health-moderate";
  if (status?.includes("Poor")) return "health-poor";
  return "health-excellent";
};

const ReportCard = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  let data;
  try {
    data = JSON.parse(item.recommendation);
  } catch {
    return null;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <motion.div
        ref={cardRef}
        className="report-card"
        onClick={() => setExpanded(!expanded)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        whileHover={{ boxShadow: "0 12px 40px rgba(46, 125, 50, 0.15)" }}
      >
        <div className="report-card-header">
          <div>
            <h3 className="report-card-farmer">👨‍🌾 {item.farmerName}</h3>
            <span className={`health-badge ${getHealthClass(data.healthStatus)} pulse`}>
              {data.healthStatus}
            </span>
          </div>
          <span className={`report-card-expand ${expanded ? "open" : ""}`}>
            ▼
          </span>
        </div>

        {expanded && (
          <motion.div
            className="report-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="report-detail">
              <div className="report-detail-label">Recommended Crop</div>
              <div className="report-detail-content">🌾 {data.recommendedCrop}</div>
            </div>

            <div className="report-detail">
              <div className="report-detail-label">Issues</div>
              <div className="report-detail-content">
                {data.issues?.length > 0 ? (
                  <ul>
                    {data.issues.map((issue, i) => (
                      <li key={i}>⚠️ {issue}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="no-issues">✅ No major issues detected</span>
                )}
              </div>
            </div>

            <div className="report-detail">
              <div className="report-detail-label">Fertilizer Advice</div>
              <div className="report-detail-content">
                {data.fertilizerAdvice?.length > 0 ? (
                  <ul>
                    {data.fertilizerAdvice.map((fert, i) => (
                      <li key={i}>🧪 {fert}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="no-issues">No fertilizer required</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ReportCard;
