const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/sign-token", (req, res) => {
  const user = {
    _id: 1,
    username: "test",
    password: "test",
  };

  // * sign() takes 3 arguments
  // The payload info, secret key, then (opt) options object (can pick hash algo type)
  const token = jwt.sign({ user }, process.env.JWT_SECRET);
  console.log("Token is signed:", token);

  res.json({ token });
});

// * verify() also takes 3 arguments
// The token to verify. The secret key. (opt) options object.

router.post("/verify-token", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token from auth header is:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded is:", decoded);

    res.json({ decoded });
  } catch (err) {
    res.status(401).json({ err: "Invalid token." });
  }
});

module.exports = router;
