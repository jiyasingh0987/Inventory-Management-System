
const Product = require("../models/Product");

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// GET ALL PRODUCTS - FILTERING, SORTING & PAGINATION
const getAllProducts = async (req, res) => {
    try {
        // 1. FILTERING
        const { category, minPrice, maxPrice, search } = req.query;

        let filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // 2. PAGINATION
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        // 3. SORTING
        const allowedSortFields = [
            "price",
            "name",
            "quantity",
            "createdAt"
        ];

        let sort = {};

        if (req.query.sort) {
            const sortField = req.query.sort.startsWith("-")
                ? req.query.sort.substring(1)
                : req.query.sort;

            if (!allowedSortFields.includes(sortField)) {
                return res.status(400).json({
                    message: "Invalid sort field"
                });
            }

            sort[sortField] = req.query.sort.startsWith("-") ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        // FETCH PRODUCTS
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
        res.status(500).json({
            message: error.message
        });
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
        res.status(500).json({
            message: error.message
        });
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
        res.status(400).json({
            message: error.message
        });
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
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
