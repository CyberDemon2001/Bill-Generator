const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    customerName: { type: String, trim: true },
    
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
        categoryId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
        name: { type: String, required: true }, // snapshot for historical integrity
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, 
        total: { type: Number, required: true }, 
      },
    ],
    
    paymentMethod: { type: String, enum: ["cash", "card", "upi"], default: "cash" }, // ✅ supports multiple methods
    
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 }, // ✅ can apply coupons
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
