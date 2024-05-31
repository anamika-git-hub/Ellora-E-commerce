const User = require('../models/userModel');

const isBlocked = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const user = await User.findById(req.session.user_id);

            if (user && user.is_blocked) {
                req.session.destroy((err) => {
                    if (err) {
                        console.log('Error destroying session:', err);
                    }
                    res.redirect('/'); // Redirect to home page or login page
                });
            } else {
                next();
            }
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    isBlocked
};
