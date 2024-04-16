const admin = require("firebase-admin");
const express = require("express");
const router = express.Router();
router.get("/checkJWT/:jwt", async (req, res) => {
  try {
    let jwt = req.params.jwt;
    let decoded = await admin.auth().verifyIdToken(jwt);
    if (decoded.uid.length > 0) {
      res
        .status(200)
        .json({ message: "Valid", admin: decoded.admin ? true : false });
    } else {
      res.status(400).json({ message: "Not valid" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/setCustomClaim", (req, res) => {
  let val = req.body.claim;
  let uid = req.body.uid;
  if (val === "Aq1sw2de3@#$") {
    admin
      .auth()
      .setCustomUserClaims(uid, { admin: true })
      .then((_) => {
        res.status(200).json({ message: "Successfully done" });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  } else {
    res.status(400).json({ message: "You are trying to tempar server" });
  }
});
router.post("/removeCustomClaim", (req, res) => {
  let val = req.body.claim;
  let uid = req.body.uid;
  if (val === "Aq1sw2de3@#$") {
    admin
      .auth()
      .setCustomUserClaims(uid, { admin: false })
      .then((_) => {
        res.status(200).json({ message: "Successfully done" });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  } else {
    res.status(400).json({ message: "You are trying to tempar server" });
  }
});
module.exports = router;
