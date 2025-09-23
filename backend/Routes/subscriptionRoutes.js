const router = require("express").Router();
const { ChangeSubscriptionPlan } = require("../Controllers/subscriptionController");

router.post("/", ChangeSubscriptionPlan);

module.exports = router;