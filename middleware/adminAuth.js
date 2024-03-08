
const isLogin = async(req,res,next)=>{
    try {
        
        if(!req.session.admin_id){
            res.redirect('/admin')
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/adminHome')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    isLogin,
    isLogout
}