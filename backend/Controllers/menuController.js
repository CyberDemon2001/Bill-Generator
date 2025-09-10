const mongoose = require("mongoose");
const Menu = require("../Database/Models/Menu");

// Create or Update Menu Category for a Restaurant
const createMenuCategory = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const { categories } = req.body;

    if (!restaurantId || !categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: "RestaurantId and at least one category are required" });
    }

    // Validate categories and items
    for (const category of categories) {
      if (!category.name) {
        return res.status(400).json({ error: "Each category must have a name" });
      }
      if (!category.items || !Array.isArray(category.items) || category.items.length === 0) {
        return res.status(400).json({ error: `Category '${category.name}' must have at least one item` });
      }

      for (const item of category.items) {
        if (!item.name) {
          return res.status(400).json({ error: `Item in category '${category.name}' must have a name` });
        }
        if (!item.price || !Array.isArray(item.price) || item.price.length === 0) {
          return res.status(400).json({ error: `Item '${item.name}' in category '${category.name}' must have price variations` });
        }
        for (const p of item.price) {
          if (!p.size || typeof p.amount !== "number") {
            return res.status(400).json({ error: `Item '${item.name}' in category '${category.name}' has invalid price format` });
          }
        }
      }
    }

    // Find restaurant menu or create new
    let menu = await Menu.findOne({ restaurantId });

    if (!menu) {
      menu = new Menu({ restaurantId, categories });
    } else {
      for (const newCategory of categories) {
        const existingCategory = menu.categories.find(
          c => c.name.toLowerCase() === newCategory.name.toLowerCase()
        );

        if (existingCategory) {
          // Merge items into existing category
          existingCategory.items.push(...newCategory.items);
        } else {
          menu.categories.push(newCategory);
        }
      }
    }

    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    console.error("Error creating categories:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get full menu of a restaurant
const getMenu = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) return res.status(404).json({ error: "Menu not found" });
    res.status(200).json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update category name
const updateMenuCategory = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const menu = await Menu.findOneAndUpdate(
      {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        "categories._id": new mongoose.Types.ObjectId(categoryId),
      },
      {
        $set: { "categories.$.name": name.trim() },
      },
      { new: true, runValidators: true }
    );

    if (!menu) {
      return res.status(404).json({ error: "Menu or category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", menu });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const { categoryId, itemId } = req.params;
    const { name, description, price } = req.body;

    const updateFields = {};
    if (name) updateFields["categories.$[cat].items.$[item].name"] = name.trim();
    if (description) updateFields["categories.$[cat].items.$[item].description"] = description.trim();
    if (price) updateFields["categories.$[cat].items.$[item].price"] = price;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const menu = await Menu.findOneAndUpdate(
      { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
      { $set: updateFields },
      {
        new: true,
        arrayFilters: [
          { "cat._id": new mongoose.Types.ObjectId(categoryId) },
          { "item._id": new mongoose.Types.ObjectId(itemId) }
        ],
        runValidators: true,
      }
    );

    if (!menu) {
      return res.status(404).json({ error: "Menu, category, or item not found" });
    }

    res.status(200).json({ message: "Menu item updated successfully", menu });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a category
const deleteMenuCategory = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const { categoryId } = req.params;

    const menu = await Menu.findOneAndUpdate(
      { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
      { $pull: { categories: { _id: new mongoose.Types.ObjectId(categoryId) } } },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({ error: "Menu or category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      menu,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const restaurantId = req.restaurant?.id;
    const { categoryId, itemId } = req.params;

    const menu = await Menu.findOneAndUpdate(
      {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        "categories._id": new mongoose.Types.ObjectId(categoryId),
      },
      {
        $pull: { "categories.$.items": { _id: new mongoose.Types.ObjectId(itemId) } },
      },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({ error: "Menu, category, or item not found" });
    }

    res.status(200).json({
      message: "Item deleted successfully",
      menu,
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createMenuCategory,
  getMenu,
  updateMenuCategory,
  updateMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
};
