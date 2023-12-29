const mongoose=require("mongoose")
const Schema=mongoose.Schema
const shortid=require("shortid")



const orderSchema= new Schema({
    orderId:{
        type:String,
        default:shortid.generate,
        unique:true
        },
        userId:{
            type:String,
            required:true
        },
        userName:{
            type:String,
            required:true
        },
        items:{
            type:Array,
            required:true
        }, 
        totalPrice:{
            type:Number,
            required:true
        },
        totalOfferPrice:{
            type:Number,

        },
        shippingAddress:{
            type:Object,
            required:true
        },
        paymentMethod:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            required:true
        },
        status:{
            type:String,
            required:true,

        },
        updatedAt:{
            type:Date,
            required:true,
            
        }
})

const orderModel=new mongoose.model("orders",orderSchema)

module.exports=orderModel
