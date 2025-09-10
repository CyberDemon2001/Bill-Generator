const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true }, // ✅ make sure to hash before saving
  
  
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", restaurantSchema);