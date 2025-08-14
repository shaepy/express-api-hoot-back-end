const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// CREATE HOOT - POST - /hoots
router.post("/", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.create({ ...req.body, author: req.user._id });
    res.status(201).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// VIEW HOOTS - GET - /hoots
router.get("/", verifyToken, async (req, res) => {
  try {
    const hoots = await Hoot.find({}).populate("author").sort({ createdAt: "desc" });
    res.status(200).json(hoots);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// VIEW HOOT - GET - /hoots/:hootId
router.get("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate("author");
    res.status(200).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// UPDATE HOOT - PUT - /hoots/:hootId
router.put("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate("author");
    // compare to see if req.user is the author of this hoot
    if (req.user._id !== hoot.author._id) {
      return res.status(403).send("Unauthorized access");
    }
    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      { ...req.body, author: req.user._id },
      { new: true }
    );
    console.log("Updated Hoot is:", updatedHoot);
    res.status(200).json(updatedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
