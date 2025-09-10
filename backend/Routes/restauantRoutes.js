const { createRestaurant, Login, updateRestaurant,getRestaurantData, logout } = require("../Controllers/restaurantController");
const checkToken = require("../Middleware/authToken");
const router = require("express").Router();

router.post("/create", createRestaurant);
router.post("/login", Login);
router.put("/update", checkToken, updateRestaurant);
router.get("/", checkToken, getRestaurantData);
router.post("/logout", checkToken, logout);

module.exports = router;