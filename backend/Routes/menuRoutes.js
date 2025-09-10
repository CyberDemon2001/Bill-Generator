const { createMenuCategory, getMenu ,updateMenuCategory, updateMenuItem,deleteMenuCategory,deleteMenuItem } = require('../Controllers/menuController');
const checkToken = require('../Middleware/authToken');

const router = require('express').Router();


router.post('/',checkToken, createMenuCategory);
router.get('/',checkToken, getMenu);
router.put('/:categoryId',checkToken, updateMenuCategory);
router.put('/:categoryId/items/:itemId',checkToken, updateMenuItem);
router.delete('/:categoryId',checkToken, deleteMenuCategory);
router.delete('/:categoryId/items/:itemId',checkToken, deleteMenuItem);

module.exports = router;
