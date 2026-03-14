const checkoutService = require("../services/checkoutService");

exports.checkout = async (req, res) => {
    try {
        const userId = Number(req.user?.userId);
        const { shipping_address } = req.body;

        if (!userId || Number.isNaN(userId)) {
            return res.status(401).json({ success: false, error: "Unauthorized user" });
        }
        if (!shipping_address || !String(shipping_address).trim()) {
            return res.status(400).json({ success: false, error: "shipping_address is required" });
        }

        const data = await checkoutService.checkout({
            userId,
            shippingAddress: String(shipping_address).trim()
        });

        return res.status(201).json({
            success: true,
            message: "Checkout successful",
            data
        });
    } catch (error) {
        console.error("Checkout error:", error);

        if (
            error.message === "Cart is empty" ||
            error.message === "Invalid cart item price" ||
            error.message === "Cart total amount is invalid"
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
