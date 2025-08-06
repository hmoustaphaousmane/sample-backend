const express = require("express");

const stripController = require("../controller/stripeController");
const checkIfLoggedIn = require("../middleware/checkIfLoggedIn");

const router = express.Router();

router.use(checkIfLoggedIn);

router.post("/initialize-payment", stripController.initializePayment);

module.exports = router;
