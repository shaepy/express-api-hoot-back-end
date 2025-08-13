const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/sign-up", async (req, res) => {
  try {
    // check to see if user already exists, return error if so
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) return res.status(409).json({ err: "Username already taken." });

    // create user
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, 12),
    });

    // create payload
    const payload = { username: user.username, _id: user._id };

    // create token & attach the payload
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    // send the token
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ username: req.body.username });
    console.log("Signing in user:", user);
    if (!user) return res.status(401).json({ err: "Invalid credentials." });

    // compare passwords
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.hashedPassword);
    console.log("isPasswordCorrect?", isPasswordCorrect);
    if (!isPasswordCorrect) return res.status(401).json({ err: "Invalid credentials." });

    // create payload
    const payload = { username: user.username, _id: user._id };
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    // send token
    res.status(209).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
