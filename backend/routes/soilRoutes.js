const express = require("express");
const router = express.Router();
const Soil = require("../models/Soil");

function analyzeSoil(ph, nitrogen, phosphorus, potassium, moisture) {

  let healthStatus = "";
  let issues = [];
  let fertilizerAdvice = [];
  let crop = "";

  // Soil Health Classification
  if (ph >= 6 && ph <= 7.5 && nitrogen >= 50 && phosphorus >= 40 && potassium >= 40) {
    healthStatus = "Soil Health: Excellent";
  } 
  else if (ph >= 5.5 && ph <= 8) {
    healthStatus = "Soil Health: Moderate";
  } 
  else {
    healthStatus = "Soil Health: Poor";
  }

  // Nutrient Deficiency Checks
  if (nitrogen < 40) {
    issues.push("Nitrogen Deficient");
    fertilizerAdvice.push("Apply Urea");
  }

  if (phosphorus < 30) {
    issues.push("Phosphorus Deficient");
    fertilizerAdvice.push("Apply DAP");
  }

  if (potassium < 30) {
    issues.push("Potassium Deficient");
    fertilizerAdvice.push("Apply Muriate of Potash");
  }

  if (ph < 5.5) {
    issues.push("Soil is Acidic");
    fertilizerAdvice.push("Add Lime Treatment");
  }

  if (ph > 8) {
    issues.push("Soil is Alkaline");
    fertilizerAdvice.push("Add Gypsum");
  }

  // Crop Recommendation
  if (ph >= 6 && ph <= 7.5 && moisture >= 40) {
    crop = "Rice";
  } else if (potassium >= 40) {
    crop = "Wheat";
  } else {
    crop = "Pulses";
  }

  return {
    healthStatus,
    issues,
    fertilizerAdvice,
    crop
  };
}

router.post("/add", async (req, res) => {
  try {
    const { farmerName, ph, nitrogen, phosphorus, potassium, moisture } = req.body;

    // Convert values to numbers (important)
    const pH = Number(ph);
    const N = Number(nitrogen);
    const P = Number(phosphorus);
    const K = Number(potassium);
    const M = Number(moisture);

    let healthStatus = "";
    let issues = [];
    let fertilizerAdvice = [];
    let crop = "";

    // Soil Health Classification
    if (pH >= 6 && pH <= 7.5 && N >= 50 && P >= 40 && K >= 40) {
      healthStatus = "Soil Health: Excellent";
    } 
    else if (pH >= 5.5 && pH <= 8) {
      healthStatus = "Soil Health: Moderate";
    } 
    else {
      healthStatus = "Soil Health: Poor";
    }

    // Deficiency Detection
    if (N < 40) {
      issues.push("Nitrogen Deficient");
      fertilizerAdvice.push("Apply Urea");
    }

    if (P < 30) {
      issues.push("Phosphorus Deficient");
      fertilizerAdvice.push("Apply DAP");
    }

    if (K < 30) {
      issues.push("Potassium Deficient");
      fertilizerAdvice.push("Apply Muriate of Potash");
    }

    if (pH < 5.5) {
      issues.push("Soil is Acidic");
      fertilizerAdvice.push("Add Lime Treatment");
    }

    if (pH > 8) {
      issues.push("Soil is Alkaline");
      fertilizerAdvice.push("Add Gypsum");
    }

    // Crop Recommendation Logic
    if (pH >= 6 && pH <= 7.5 && M >= 40) {
      crop = "Rice";
    } 
    else if (K >= 40) {
      crop = "Wheat";
    } 
    else {
      crop = "Pulses";
    }

    const result = {
      healthStatus,
      issues,
      fertilizerAdvice,
      recommendedCrop: crop
    };

    const newSoil = new Soil({
      farmerName,
      ph: pH,
      nitrogen: N,
      phosphorus: P,
      potassium: K,
      moisture: M,
      recommendation: JSON.stringify(result)
    });

    await newSoil.save();

    res.status(200).json(newSoil);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const data = await Soil.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
