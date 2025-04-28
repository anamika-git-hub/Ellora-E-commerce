const { isBlocked } = require('../middleware/isBlocked');

const isLogin = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            if (req.path === '/addWishlist' || req.path === '/addCart') {
                const message = req.path === '/wishlist'
                    ? "Please login to add items to your wishlist."
                    : "Please login to add items to your cart.";
                res.status(401).json({ login: true, message });
            } else {
                res.redirect('/');
            }
        } else {
            await isBlocked(req, res, next); // Check if the user is blocked
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    isLogin,
    isLogout
};
