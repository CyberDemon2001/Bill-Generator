const Order = require("../Database/Models/Order");
const Menu = require("../Database/Models/Menu");

// Create a new order
const createOrder = async (req, res) => {
  console.log("Creating order:", req.restaurant.id, req.body);
  try {
    const restaurantId = req.restaurant.id;
    const { customerName, items, paymentMethod } = req.body;

    // --- Validation ---
    if (!restaurantId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "restaurantId, customerName and at least one item are required" });
    }

    // Find menu for the restaurant
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ error: "Menu not found for this restaurant" });
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { categoryId, menuItemId, size, quantity } = item;

      if (!categoryId || !menuItemId || !size || !quantity) {
        return res.status(400).json({ error: "Each item must include categoryId, menuItemId, size, and quantity" });
      }

      // Find category in menu
      const category = menu.categories.id(categoryId);
      if (!category) {
        return res.status(404).json({ error: `Category ${categoryId} not found` });
      }

      // Find item in category
      const foundItem = category.items.id(menuItemId);
      if (!foundItem) {
        return res.status(404).json({ error: `Item ${menuItemId} not found in category ${categoryId}` });
      }

      // Find matching size price
      const priceObj = foundItem.price.find(p => p.size === size);
      if (!priceObj) {
        return res.status(400).json({ error: `Size '${size}' not available for item '${foundItem.name}'` });
      }

      const unitPrice = priceObj.amount;
      const total = unitPrice * quantity;
      subtotal += total;

      orderItems.push({
        menuItemId,
        categoryId,
        name: foundItem.name,
        size,
        quantity,
        price: unitPrice,
        total,
      });
    }

    // Tax & Total
    const tax = parseFloat((subtotal * 0.0).toFixed(2)); // 0% tax
    const totalAmount = parseFloat((subtotal + tax).toFixed(2));

    const newOrder = new Order({
      restaurantId,
      customerName,
      paymentMethod,
      items: orderItems,
      subtotal,
      tax,
      totalAmount,
    });

    await newOrder.save();
    res.status(201).json(newOrder);

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (optionally by date & restaurantId)
const getOrders = async (req, res) => {
  try {
    const restaurantId = req.restaurant?.id;
    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId is required" });
    }

    // Always filter by restaurantId
    let query = { restaurantId };

    // Optional date filter
    if (req.query.date) {
      const targetDate = new Date(req.query.date);
      targetDate.setUTCHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setUTCDate(targetDate.getUTCDate() + 1);

      query.createdAt = { $gte: targetDate, $lt: nextDay };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createOrder, getOrders };
