const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// * Hoots

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
    const hoots = await Hoot.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(hoots);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// VIEW HOOT - GET - /hoots/:hootId
router.get("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate(
      "author",
      "comments.author"
    );
    res.status(200).json(hoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// UPDATE HOOT - PUT - /hoots/:hootId
router.put("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    console.log("Found the hoot to update:", hoot);

    // compare to see if req.user is the author of this hoot
    if (req.user._id !== hoot.author.toString()) {
      return res.status(403).send("Unauthorized access");
    }
    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    );
    console.log("Updated Hoot is:", updatedHoot);
    res.status(200).json(updatedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE HOOT - DELETE - /hoots/:hootId
router.delete("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    console.log("Found the hoot to update:", hoot);

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("Unauthorized access");
    }

    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// * Comments

// NEW COMMENT - POST - /hoots/:hootId/comments
router.post("/:hootId/comments", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    // comments is embedded
    hoot.comments.push({ ...req.body, author: req.user._id });
    await hoot.save();
    const newComment = hoot.comments[hoot.comments.length - 1];
    console.log("newComment is:", newComment);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// UPDATE COMMENT - PUT - /hoots/:hootId/comments/:commentId
router.put("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);
    if (!comment.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }
    comment.text = req.body.text;
    await hoot.save();
    res.status(200).json({ message: "Comment updated successfully." });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE COMMENT - DELETE - /hoots/:hootId/comments/:commentId
router.delete("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);
    if (!comment.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }
    hoot.comments.id(req.params.commentId).deleteOne();
    // another way to write: hoot.comments.remove({ _id: req.params.commentId });
    await hoot.save();
    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
