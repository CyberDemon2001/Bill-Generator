const { createOrder, getOrders } = require('../Controllers/orderController');
const checkToken = require('../Middleware/authToken');

const router = require('express').Router();

router.post('/', checkToken, createOrder);
router.get('/', checkToken, getOrders);

module.exports = router;