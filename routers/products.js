const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(
      null,
      `${fileName.replace("." + extension, "")}-${Date.now()}.${extension}`
    );
  },
});

const upload = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name -_id"
  );
  if (!product) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

router.post(`/`, upload.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }
  const file = req.file;
  if (!file) {
    return res.status(400).send("Not file");
  }
  const filename = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let product = new Product({ ...req.body, image: `${basePath}${filename}` });
  product = await product.save();
  if (!product) {
    return res.status(500).json({
      error: error,
      success: false,
    });
  }
  res.status(201).json(product);
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid category");
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("The product cannot be update!");
    }
    const file = req.file;
    let imagepath;
    if (file) {
      const filename = req.file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagepath = `${basePath}${filename}`;
    } else {
      imagepath = product.image;
    }
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: imagepath },
      {
        new: true,
      }
    );
    if (!updateProduct)
      return res.status(500).send("the produc cannot be updated!");
    res.status(200).send(updateProduct);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removeProduct = await Product.findByIdAndRemove(req.params.id);
    if (!removeProduct) {
      return res.status(404).json({
        success: false,
        message: "product not fount",
      });
    }
    res.status(200).json({
      success: true,
      message: "The product is deleted!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments({});
    if (!productCount) {
      return res.status(500).json({
        success: false,
      });
    }
    res.status(200).json({ productCount });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/get/featured", async (req, res) => {
  try {
    const count = req.query.count ? req.query.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);
    if (!products) {
      return res.status(500).json({
        success: false,
      });
    }
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.put(
  "/gallery-images/:id",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).send("The product cannot be update!");
      }
      const files = req.files;
      let imagePaths = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      if (files) {
        files.map((file) => {
          console.log(file);
          imagePaths.push(`${basePath}${file.filename}`);
        });
      }
      const updateProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagePaths,
        },
        {
          new: true,
        }
      );
      if (!updateProduct)
        return res.status(500).send("the product cannot be updated!");
      res.status(200).send(updateProduct);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error,
      });
    }
  }
);
module.exports = router;
