const express = require("express");
const router = express.Router();
const userModel = require("../model/User");
const bcrypt = require("bcrypt");

router.get("/signin", (req, res, next) => {
  res.render("auth/signin");
});

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.get("/signout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

router.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const foundUser = await userModel.findOne({ email: email });
    if (!foundUser) {
      req.flash("error", "Invalid credentials");
      res.redirect("/auth/signin");
    } else {
      const isSamePasseword = bcrypt.compareSync(password, foundUser.password);
      if (!isSamePasseword) {
        req.flash("error", "Invalid credentials");
        res.redirect("/auth/signin");
      } else {
        const userObject = foundUser.toObject();
        delete userObject.password;
        req.session.currentUser = userObject;
        // req.flash("success", "Successfully logged in...");
        res.redirect("/");
      }
    }
  } catch (err) {
    next(err);
  }
});


router.post("/signup", async (req, res, next) => {
  try {
    const newUser = { ...req.body };
    const foundUser = await userModel.findOne({ email: newUser.email });
    if (foundUser) {
      // req.flash("warning", "Email already registered");
      res.redirect("/auth/signup");
    } else {
      const hashedPassword = bcrypt.hashSync(newUser.password, 10);
      // console.log("---------");
      // console.log(newUser.password, hashedPassword);
      // console.log("---------");
      newUser.password = hashedPassword;
      await userModel.create(newUser);
      // req.flash("success", "Congrats ! You are now registered !");
      res.redirect("/auth/signin");
    }
  } catch (err) {
    // let errorMessage = "";
    // for (field in err.errors) {
    //   errorMessage += err.errors[field].message + "\n";
    // }
    // req.flash("error", errorMessage);
    res.redirect("/auth/signup");
  }
});

module.exports = router;
