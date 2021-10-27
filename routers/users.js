const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(userList);
});
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(user);
});

router.post("/register", async (req, res) => {
  let user = new User(req.body);
  user = await user.save();
  if (!user) {
    return res.status(404).send("The user cannot be register");
  }
  res.send(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("The user not found");
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    return res.status(200).send({ user: user.email, token });
  }
  return res.status(400).send("Password wrong");
});

router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    if (!userCount) {
      return res.status(500).json({
        success: false,
      });
    }
    res.status(200).json({ userCount: userCount });
  } catch (error) {
    res.status(500).json({ error });
  }
});
module.exports = router;
