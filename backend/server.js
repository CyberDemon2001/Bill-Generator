const express = require('express');
const DBConnect = require('./Database/DBConnect');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const menuRoutes = require('./Routes/menuRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const restaurantRoutes = require('./Routes/restauantRoutes');

const app = express();

const PORT = process.env.PORT;

DBConnect();

app.use(express.json());
app.use(cors({origin:"*",credentials:true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to the Bill Generator API');
});

app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/restaurants', restaurantRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
