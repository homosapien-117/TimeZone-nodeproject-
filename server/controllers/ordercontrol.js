const orderModel=require("../models/ordermodel")

const orderPage=async(req,res)=>{
    try {
        const orders=await orderModel.find({}).sort({createdAt:-1});
        res.render("admin/orderpage",{orderdata:orders})
        console.log(orders);
    } catch (error) {
        console.log(error);
    }
}


const updateorderstatus=async(req,res)=>{
    try {
        const {orderId,status}=req.body
        const updatedOrder=await orderModel.findOneAndUpdate(
            {_id:orderId},
            {$set:{status:status,updatedAt:Date.now()}},
            {new:true}
        )
        if(!updatedOrder){
            return res.status(404).json({error:"order not found"})
        }
        res.redirect('admin/orderPage')
    } catch (error) {
        console.log(error);
    }
}


module.exports={
    orderPage,
    updateorderstatus
}