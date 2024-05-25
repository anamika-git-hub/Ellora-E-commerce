
const isLogin = (req, res, next) => {
    try {
        if (!req.session.user_id) {
            if (req.path === '/wishlist' || req.path === '/cart' || req.path === '/addCart') {
                const message = req.path === '/wishlist'
                    ? "Please login to add items to your wishlist."
                    : "Please login to add items to your cart.";
                res.status(401).json({ login: true, message });
            } else {
                res.redirect('/');
            }
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};



const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    isLogin,
    isLogout
}