const catModel=require("../models/category_model")
const userModel=require("../models/usermodel")
const cartModel=require("../models/cart_model")
const productModel=require("../models/product_model")
const orderModel=require("../models/ordermodel")
const shortid = require("shortid")
const bcrypt=require("bcrypt")
const mongoose =require("mongoose")
const walletModel=require('../models/wallet_model')
const couponModel=require('../models/coupon_model')
const Razorpay=require("razorpay")
const KEY_ID='rzp_test_PSAnCXtUPXVgWO';
const key_secret='6lQXlklpxd83A1tDcJuMCznM';
const ShortUniqueId= require('short-unique-id');
const moment = require("moment");
let date = moment();


const checkoutreload=async(req,res)=>{
    try {
      const userId=req.session.userId
      const{saveas,fullname,adname,street,pincode,city,state,country,phone}=req.body;
      console.log("userid",req.session.userId);
      const user = await userModel.findById(userId);
      const availableCoupons = await couponModel.find({
        couponCode: { $nin: user.usedCoupons },
        status:true
      });
        const existingUser=await userModel.findOne({_id:userId})
        console.log("exixteing user",existingUser);

        if (existingUser) {
            const existingAddress = await userModel.findOne({
                "_id": userId,
                "address": {
                    $elemMatch: {
                        "fullname": fullname,
                        "adname": adname,
                        "street": street,
                        "pincode": pincode,
                        "city": city,
                        "state": state,
                        "country": country,
                        "phonenumber": phone
                    }
                }
            });

            if (existingAddress) {
                const categories = await catModel.find();
                const cartId = req.body.cartId;
                const addresslist = await userModel.findOne({ _id: userId });

                if (!addresslist) {
                    console.log("user not found");
                    return res.status(404).send("user not found");
                }

                const addresses = addresslist.address;
                if (!cartId) {
                    console.log("cart Id not found");
                    return res.status(404).send("cart not found");
                }

                const cart = await cartModel.findById(cartId).populate('item.productId');
                if (!cart) {
                    console.log("cart not found");
                    return res.status(404).send("cart not found");
                }

                const cartItems = cart.item.map((cartItem) => ({
                    productName: cartItem.productId.name,
                    quantity: cartItem.quantity,
                    itemTotal: cartItem.total
                }));

                console.log("cart total", cartItems);
                return res.render("user/checkout", { availableCoupons,addresses, cartItems, categories, cart, addressExistsWarning: true });
            }

            console.log("its user", existingAddress);
            // If the address doesn't exist, proceed to add the new address
            existingUser.address.push({
                saveas: saveas,
                fullname: fullname,
                adname: adname,
                street: street,
                pincode: pincode,
                city: city,
                state: state,
                country: country,
                phonenumber: phone
            });

            await existingUser.save();
        }

        const categories=await catModel.find()
        const cartId=req.body.cartId;
        const addresslist=await userModel.findOne({_id:userId});
        if(!addresslist){
            console.log("user not foound");
            return res.status(404).send("user not found");
        }
        const addresses=addresslist.address;
        if(!cartId){
            console.log("cart Id not found");
            return res.status(404).send("cart not found")
        }
        const cart = await cartModel.findById(cartId).populate('item.productId');
        if(!cart){
            console.log("cart not found");
            return res.status(404).send("cart not found")
        }

        const cartItems=cart.item.map((cartItem)=>({
            productNme:cartItem.productId.name,
            quantity:cartItem.quantity,
            itemTotal:cartItem.total

        }))
        console.log("cart total",cartItems);
        res.render("user/checkout",{availableCoupons,addresses,cartItems,categories,cart})
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}


const placeorder = async (req, res) => {
  try {
    const categories = await catModel.find({});
    const addressId = req.body.selectedAddressId;
    const user = await userModel.findOne({
      address: { $elemMatch: { _id: addressId } },
    });
    if (!user) {
      return res.status(404).send("user not found");
    }
    const selectedAddress = user.address.find((address) =>
      address._id.equals(addressId)
    );
    const userId = req.session.userId;
    const username = selectedAddress.fullname;
    const paymentMethod = req.body.selectedPaymentOption;
    const selectedProductNames = req.body.selectedProductNames;

if (!selectedProductNames || !Array.isArray(selectedProductNames)) {
  return res.status(400).send('selectedProductNames is missing or not an array.');
}

    const items = req.body.selectedProductNames.map((productName, index) => ({
      productName: req.body.selectedProductNames[index],
      productId: new mongoose.Types.ObjectId(
        req.body.selectedProductIds[index]
      ),
      quantity: parseInt(req.body.selectedQuantities[index]),
      price: parseInt(req.body.selectedCartTotals[index]),
    }));
    const uid = new ShortUniqueId();

const order = new orderModel({
  orderId: uid.randomUUID(6),
  userId: userId,
  userName: username,
  items: items,
  totalPrice: parseInt(req.body.carttotal),
  shippingAddress: selectedAddress,
  paymentMethod: paymentMethod,
  updatedAt: date.format("YYYY-MM-DD HH:mm"),
  createdAt: date.format("YYYY-MM-DD HH:mm"),
  status: "pending",
});

    console.log("items", items);
    await order.save();

    for (const item of items) {
      await cartModel.updateOne(
        { userId: userId },
        { $pull: { item: { productId: item.productId } } }
      );
      await cartModel.updateOne({ userId: userId }, { $set: { total: 0 } });
    }

    for (const item of items) {
      await productModel.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    req.session.checkout=false

    res.render("user/orderconfirmation", { order, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

  const instance = new Razorpay({ key_id: KEY_ID, key_secret: key_secret });
  const upi = async (req, res) => {
    console.log("body:", req.body);
    var options = {
      amount: 500,
      currency: "INR",
      receipt: "order_rcpt",
    };
    instance.orders.create(options, function (err, order) {
      console.log("order1 :", order);
      res.send({ orderId: order.id });
  });
  
  };

const wallettransaction=async(req,res)=>{
    try {
        console.log("ibda indu mwoney");
        const userid=req.session.userId;
        const amount=req.body.amount
        const user=await walletModel.findOne({userId:userid})
        console.log(userid);
        const wallet=user.wallet
        console.log("ithu wallet",wallet);
        
        if(user.wallet>=amount){
            user.wallet-=amount
            await user.save()
            const wallet=await walletModel.findOne({userId:userid})
            wallet.walletTransactions.push({
            reason:"order placed",
            type:'Debited',
            amount:amount,
            date:new Date()
        })
        await wallet.save();
        res.json({success:true})
        }
        else
        {
            res.json({success:false,message:'dont have enough money'})
        }
    } catch (error) {
        console.log(error);
        res.send(error) 
    }
}

const applyCoupon = async (req, res) => {
    try {
      const { couponCode, subtotal } = req.body;
      console.log("ithu total",subtotal)
      const userId=req.session.userId
      const coupon = await couponModel.findOne({ couponCode: couponCode });
      console.log(coupon);
      
      if (coupon&&coupon.status===true) {
  
          const user = await userModel.findById(userId);
  
          if (user && user.usedCoupons.includes(couponCode)) {
            console.log("nvjksadnjkghakjvajkvnasdmvbasfhvb");
            res.json({ success: false, message: "Already Redeemed" });
          }
          else if (coupon.expiry > new Date() && coupon.minimumPrice <= subtotal) {
              console.log("Coupon is valid");
              let dicprice;
              let price;
              if(coupon.type==="percentageDiscount"){
                dicprice = (subtotal * coupon.discount) / 100;
                if(dicprice>=coupon.maxRedeem){
                  dicprice=coupon.maxRedeem
                }
                price = subtotal - dicprice;
              }else if(coupon.type==="flatDiscount"){
                dicprice=coupon.discount
                price=subtotal-dicprice
  
              }
              
              console.log("ithu priceaahmu",price,dicprice);
  
              await userModel.findByIdAndUpdate(
                userId,
                { $addToSet: { usedCoupons: couponCode } },
                { new: true }
              );
              res.json({ success: true, dicprice, price });
          } else {
              res.json({ success: false, message: "Invalid Coupon" });
          }
      } else {
          res.json({ success: false, message: "Coupon not found" });
      }
      
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred');
  }
  }
const recokeCoupon=async(req,res)=>{
    try {
        console.log("eeelu kayari")
        const { couponCode,subtotal}=req.body
        const userId=req.session.userId 
        const coupon=await couponModel.findOne({couponCode:couponCode})
        console.log(coupon);

        if(coupon){
            const user=await userModel.findOne({userId:userId})
            if (coupon.expiry > new Date() && coupon.minimumPrice <= subtotal) {
                console.log("Coupon is valid");
                const dprice = (subtotal * coupon.discount) / 100;
                const dicprice = 0;
    
                const price = subtotal;
                console.log(price);
    
                await userModel.findByIdAndUpdate(
                  userId,
                  { $pull: { usedCoupons: couponCode } },
                  { new: true }
                );
                res.json({ success: true, dicprice, price });
            } else {
                res.json({ success: false, message: "Invalid Coupon" });
            }
        }else{
            res.json({success:false,message:"coupon not found"})

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error occurred');
    }
}


module.exports={
    placeorder,
    checkoutreload,
    wallettransaction,
    applyCoupon,
    recokeCoupon,
    upi
}