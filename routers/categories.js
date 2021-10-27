const express = require("express");
const router = express.Router();
const Category = require("../models/category");
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(categoryList);
});
router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(category);
});

router.post("/", async (req, res) => {
  let category = new Category(req.body);
  category = await category.save();
  if (!category) {
    return res.status(404).send("The category cannot be created!");
  }
  res.send(category);
});

router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    {
      new: true,
    }
  );
  if (!category) {
    return res.status(404).send("The category cannot be update!");
  }
  res.status(200).send(category);
});
router.delete("/:id", async (req, res) => {
  try {
    const removeCategory = await Category.findByIdAndRemove(req.params.id);
    if (!removeCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not fount",
      });
    }
    res.status(200).json({
      success: true,
      message: "The category is deleted!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});
module.exports = router;
