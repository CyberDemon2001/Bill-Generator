const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true }, // ✅ make sure to hash before saving

  subscriptionPlan: { 
    plan: { type: String, enum: ['trial', 'monthly', 'yearly'], default: 'trial' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
  },

  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
}, { timestamps: true });

restaurantSchema.pre("save", function (next) {
  if (this.isNew && this.subscriptionPlan.plan === "trial") {
    this.subscriptionPlan.startDate = new Date();
    this.subscriptionPlan.endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days
  }
  next();
});


module.exports = mongoose.model("Restaurant", restaurantSchema);