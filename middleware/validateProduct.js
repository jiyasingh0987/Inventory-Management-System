// Validate product input
const validateProduct = (req, res, next) => {
    const {
        name,
        sku,
        category,
        price,
        quantity,
        reorderLevel,
        supplier
    } = req.body;

    const errors = [];

    if (!name || typeof name !== "string") {
        errors.push("Valid product name is required");
    }

    if (!sku || typeof sku !== "string") {
        errors.push("Valid SKU is required");
    }

    if (!category || typeof category !== "string") {
        errors.push("Valid category is required");
    }

    if (typeof price !== "number" || price < 0) {
        errors.push("Price must be a non-negative number");
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
        errors.push("Quantity must be a non-negative integer");
    }

    if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
        errors.push("Reorder level must be a non-negative integer");
    }

    if (!supplier || typeof supplier !== "string") {
        errors.push("Valid supplier is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate product update
const validateProductUpdate = (req, res, next) => {
    const allowedFields = [
        "name", "sku", "category",
        "price", "quantity", "reorderLevel", "supplier"
    ];

    const errors = [];
    const fields = Object.keys(req.body);

    if (fields.length === 0) {
        errors.push("At least one field is required for update");
    }

    fields.forEach((field) => {
        if (!allowedFields.includes(field)) {
            errors.push(`Invalid field: ${field}`);
        }
    });

    const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
        errors.push("Name must be a valid string");
    }

    if (sku !== undefined && (typeof sku !== "string" || !sku.trim())) {
        errors.push("SKU must be a valid string");
    }

    if (category !== undefined && (typeof category !== "string" || !category.trim())) {
        errors.push("Category must be a valid string");
    }

    if (supplier !== undefined && (typeof supplier !== "string" || !supplier.trim())) {
        errors.push("Supplier must be a valid string");
    }

    if (price !== undefined && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) {
        errors.push("Price must be a non-negative number");
    }

    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
        errors.push("Quantity must be a non-negative integer");
    }

    if (reorderLevel !== undefined && (!Number.isInteger(reorderLevel) || reorderLevel < 0)) {
        errors.push("Reorder level must be a non-negative integer");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

module.exports = {
    validateProduct,
    validateProductUpdate
};