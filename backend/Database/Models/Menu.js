const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  categories: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ✅ give category its own id
      name: { type: String, required: true, trim: true },
      items: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          name: { type: String, required: true, trim: true },
          price: [
            {
              size: { type: String, required: true, trim: true },
              amount: { type: Number, required: true, min: 0 },
            },
          ],
          available: { type: Boolean, default: true }, // ✅ allows enabling/disabling items
        },
      ],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);