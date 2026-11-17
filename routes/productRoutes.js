const express = require("express");
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getProductSummary,
    adjustProductStock
} = require("../controllers/productController");

const {
    validateProduct,
    validateProductUpdate
} = require("../middleware/validateProduct");

const validateObjectId = require("../middleware/validateObjectId");

// CREATE PRODUCT
router.post("/", validateProduct, createProduct);

// GET ALL PRODUCTS
router.get("/", getAllProducts);

// LOW STOCK REPORT
router.get("/low-stock", getLowStockProducts);

// CATEGORY SUMMARY
router.get("/summary", getProductSummary);

// STOCK ADJUSTMENT
router.patch("/:id/stock", validateObjectId, adjustProductStock);

// GET PRODUCT BY ID
router.get("/:id", validateObjectId, getProductById);

// UPDATE PRODUCT
router.put("/:id", validateObjectId, validateProductUpdate, updateProduct);

// DELETE PRODUCT
router.delete("/:id", validateObjectId, deleteProduct);

module.exports = router;
