const loadOrderList=async(req,res)=>{
    try {
        res.render('orderList')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    loadOrderList
}