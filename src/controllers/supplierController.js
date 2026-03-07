const supplierService = require("../services/supplierService");

exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        console.error("Supplier list error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ success: false, error: "Supplier not found" });
        }

        res.json({
            success: true,
            data: supplier
        });
    } catch (error) {
        console.error("Get supplier error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

exports.createSupplier = async (req, res) => {
    try {
        const newSupplier = await supplierService.createSupplier(req.body);
        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: newSupplier
        });
    } catch (error) {
        console.error("Create supplier error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

exports.updateSupplier = async (req, res) => {
    try {
        const existingSupplier = await supplierService.getSupplierById(req.params.id);
        if (!existingSupplier) {
            return res.status(404).json({ success: false, error: "Supplier not found" });
        }

        const updatedSupplier = await supplierService.updateSupplier(req.params.id, req.body);
        res.json({
            success: true,
            message: "Supplier updated successfully",
            data: updatedSupplier
        });
    } catch (error) {
        console.error("Update supplier error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

exports.deleteSupplier = async (req, res) => {
    try {
        const existingSupplier = await supplierService.getSupplierById(req.params.id);
        if (!existingSupplier) {
            return res.status(404).json({ success: false, error: "Supplier not found" });
        }

        const result = await supplierService.deleteSupplier(req.params.id);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error("Delete supplier error:", error);

        if (error.message && error.message.toLowerCase().includes("reference constraint")) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete supplier because products are still linked to this supplier"
            });
        }

        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
