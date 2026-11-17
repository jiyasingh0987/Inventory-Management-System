
const Product = require("../models/Product");

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET ALL PRODUCTS WITH FILTERING, SORTING & PAGINATION
const getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;

        let filter = {};

        if (category) filter.category = category;

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const allowedSortFields = ["price", "name", "quantity", "createdAt"];
        let sort = { createdAt: -1 };

        if (req.query.sort) {
            const field = req.query.sort.startsWith("-")
                ? req.query.sort.substring(1)
                : req.query.sort;

            if (!allowedSortFields.includes(field)) {
                return res.status(400).json({
                    message: "Invalid sort field"
                });
            }

            sort = {
                [field]: req.query.sort.startsWith("-") ? -1 : 1
            };
        }

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "Products fetched successfully",
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            count: products.length,
            data: products
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            data: product
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET LOW STOCK PRODUCTS
const getLowStockProducts = async (req, res) => {
    try {
        const lowStockItems = await Product.find({
            $expr: {
                $lte: ["$quantity", "$reorderLevel"]
            }
        });

        res.status(200).json({
            message: "Low stock products fetched successfully",
            count: lowStockItems.length,
            lowStockItems
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CATEGORY-WISE PRODUCT SUMMARY
const getProductSummary = async (req, res) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" },
                    totalStockValue: {
                        $sum: {
                            $multiply: ["$price", "$quantity"]
                        }
                    },
                    avgPrice: { $avg: "$price" }
                }
            }
        ]);

        res.status(200).json({
            message: "Product summary fetched successfully",
            categories: summary.length,
            summary
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADJUST PRODUCT STOCK
const adjustProductStock = async (req, res) => {
    try {
        const { change } = req.body;

        if (
            typeof change !== "number" ||
            !Number.isFinite(change) ||
            change === 0
        ) {
            return res.status(400).json({
                message: "Change must be a non-zero number"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.quantity + change < 0) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        product.quantity += change;
        await product.save();

        res.status(200).json({
            message: "Stock adjusted successfully",
            data: product
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// EXPORTS
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getProductSummary,
    adjustProductStock
};
