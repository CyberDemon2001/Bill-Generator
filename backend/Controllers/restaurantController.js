const bcrypt = require("bcryptjs");
const Restaurant = require("../Database/Models/Restaurant");
const jwt = require("jsonwebtoken");

const createRestaurant = async (req, res) => {
  console.log("Creating restaurant:", req.body);
  try {
    const { restaurantName, address, phone, email, password } = req.body;

    // 1. Validate required fields
    if (!restaurantName || !address || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if restaurant already exists (email must be unique)
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new restaurant
    const newRestaurant = new Restaurant({
      restaurantName,
      address,
      phone,
      email,
      password: hashedPassword,
    });

    await newRestaurant.save();

    // 5. Respond without password
    const { password: _, ...restaurantData } = newRestaurant.toObject();

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: restaurantData,
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const restaurant = await Restaurant.findOne({ email }).populate("menu");
    if (!restaurant)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    if(restaurant.subscriptionPlan.endDate < new Date()){
      restaurant.subscriptionPlan.isActive = false;
      await restaurant.save();
      return res.status(403).json({ message: "Trial period has ended. Please upgrade your subscription." });
    }

    const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: false, // must be false for localhost
      sameSite: "lax", // 'none' + secure only works in HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...restaurantData } = restaurant.toObject();
    res
      .status(200)
      .json({ message: "Login successful", token, restaurant: restaurantData });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const updates = req.body;

    // Find restaurant and update
    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ message: "Restaurant updated successfully", restaurant });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};

const getRestaurantData = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const restaurant = await Restaurant.findById(restaurantId).select("-password -email");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json({ restaurant });
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    res.status(500).json({ message: "Error fetching restaurant data" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
};




module.exports = { createRestaurant, Login, updateRestaurant, getRestaurantData, logout };
