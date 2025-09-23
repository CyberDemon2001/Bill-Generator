const Restaurant = require("../Database/Models/Restaurant");

const ChangeSubscriptionPlan = async (req, res) => {

    console.log("ChangeSubscriptionPlan called with body:", req.body);
    
  try {

    const { email, newPlan } = req.body;

    

    // Validate newPlan
    const validPlans = ["trial", "monthly", "yearly"];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    // Find restaurant by email
    const restaurant = await Restaurant.findOne({ email: email.trim().toLowerCase() });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update subscription details
    const startDate = new Date();
    let endDate;

    if (newPlan === "monthly") {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (newPlan === "yearly") {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (newPlan === "trial") {
      endDate = new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days
    }

    restaurant.subscriptionPlan = {
      plan: newPlan,
      startDate,
      endDate,
      isActive: true,
    };

    await restaurant.save();

    return res.status(200).json({
      message: "Subscription plan updated successfully",
      subscriptionPlan: restaurant.subscriptionPlan,
    });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { ChangeSubscriptionPlan };
