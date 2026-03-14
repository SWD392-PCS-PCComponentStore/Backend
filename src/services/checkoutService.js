const CheckoutModel = require("../models/checkoutModel");

exports.checkout = async ({ userId, shippingAddress }) => {
    return await CheckoutModel.checkoutFromCart({
        userId,
        shippingAddress
    });
};
