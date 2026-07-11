import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import axios from "axios";
import "./SoilForm.css";

const SoilForm = ({ onRecordAdded }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    farmerName: "",
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    moisture: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/soil/add`, formData);
      await onRecordAdded();
    } catch (err) {
      console.error("Error submitting form:", err);
    }
    setLoading(false);
    setFormData({
      farmerName: "",
      ph: "",
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      moisture: "",
    });
  };

  const fields = [
    { key: "farmerName", type: "text", label: "Farmer Name" },
    { key: "ph", type: "number", label: "pH Level" },
    { key: "nitrogen", type: "number", label: "Nitrogen (N)" },
    { key: "phosphorus", type: "number", label: "Phosphorus (P)" },
    { key: "potassium", type: "number", label: "Potassium (K)" },
    { key: "moisture", type: "number", label: "Moisture %" },
  ];

  return (
    <section className="soil-form-section" id="soil-form">
      <motion.div
        ref={ref}
        className="form-card"
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2 className="form-title">Enter Soil Details</h2>
        <p className="form-subtitle">
          Provide your soil metrics for a personalized health analysis
        </p>

        <form onSubmit={handleSubmit} className="soil-form">
          {fields.map((field) => (
            <div
              key={field.key}
              className={`form-group ${field.key === "farmerName" ? "full-width" : ""}`}
            >
              <label className="form-label">{field.label}</label>
              <input
                name={field.key}
                type={field.type}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={formData[field.key]}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          ))}

          <motion.button
            type="submit"
            className="submit-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <span className="grow-plant">🌱</span> Analyzing...
              </>
            ) : (
              "Analyze Soil"
            )}
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default SoilForm;
