const productModel=require("../models/product_model")
const catModel=require("../models/category_model")
const userModel=require("../models/usermodel")
const cartModel=require("../models/cart_model")
const couponModel=require("../models/coupon_model")

const showcart=async(req,res)=>{
    try {
        const id=req.session.userId;
        const sessionId=req.session.id
        const categories=await catModel.find()
        let cart;
        console.log(id);;
        if(id){
            cart=await cartModel.findOne({userId:id}).populate({
                path:"item.productId",
                select:"images name price"
            })
        }
        else if(!cart || !cart.item){
            cart=new cartModel({
                sessionId:req.session.id,
                item:[],
                total:0,
            })
        }
        console.log("its cart",cart);
        res.render("user/cart",{cart,categories})
    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const addtocart=async(req,res)=>{
    try {
        const pid=req.params.id
        const product=await productModel.findOne({_id:pid})
        const userid=req.session.userId
        const price=product.price
        const stock=product.stock
        const quantity=1
        let cart;
        if (userid) {
            cart = await cartModel.findOne({ userId: userid });
        }
        if (!cart) {
            cart = await cartModel.findOne({ sessionId: req.session.id });
        }
        if (!cart) {
            cart = new cartModel({
              sessionId: req.session.id,
              item: [],
              total: 0,
            });
        }
        const productExist = cart.item.findIndex((item) => item.productId == pid);
        if (productExist !== -1) {
            cart.item[productExist].quantity += 1;
            cart.item[productExist].total =
            cart.item[productExist].quantity * price;
          } else {
            const newItem = {
              productId: pid,
              quantity: 1,
              price: price,
              stock :stock,
              total: quantity * price,
            };
            cart.item.push(newItem);
          }
      
          if (userid && !cart.userId) {
            cart.userId = userid;
          }
      
        cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);
      
        await cart.save();
        res.redirect('/cartpage');
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}

const deletecart=async(req,res)=>{
    try {
        const userId=req.session.userId
        const pid=req.params.id
        const size=req.params.size
        console.log("deleting item ",{userId,pid});
        const result=await cartModel.updateOne({userId:userId},{$pull:{item:{_id:pid}}})
        console.log("updated",result)
        const updatedcart=await cartModel.findOne({userId:userId})
        const newTotal=updatedcart.item.reduce((acc, item) => acc + item.total, 0);
        updatedcart.total=newTotal
        await updatedcart.save()
        res.redirect("/cartpage")
    } catch (error) {
        console.log(error);
        res.send(error) 
        
    }
}

const updatecart=async(req,res)=>{
    console.log(req.body,);
    try {
        console.log("hi");
        console.log('Received Request:', req.body);
        const { productId } = req.params;
        const { action, cartId } = req.body;
        console.log('Action:', action);

        const cart = await cartModel.findOne({ _id: cartId });
        console.log("cartId", cartId);
        console.log("cart", cart);
        console.log("productc id ",productId);
        const itemIndex = cart.item.findIndex(item => item._id == productId);
        console.log(itemIndex)
    
        console.log("itemIndex", itemIndex);
        console.log("Cart Items:", cart.item);
    
        console.log(cart.item[itemIndex].quantity);
        console.log(cart.item[itemIndex].stock);
        console.log(cart.item[itemIndex].price);
        const currentQuantity = cart.item[itemIndex].quantity;
        const selectedProductId= cart.item[itemIndex].productId
        const selectedProduct=await productModel.findOne({_id:selectedProductId})
        console.log("selctedproduct",selectedProduct)
        const stockLimit = selectedProduct.stock;
        console.log("limit",stockLimit)
        const price = cart.item[itemIndex].price;
    
        let updatedQuantity;
    
        if (action == '1') {
          console.log("1");
          updatedQuantity = currentQuantity + 1;
        } else if (action == '-1') {
          console.log("-1");
          updatedQuantity = currentQuantity - 1;
        } else {
          return res.status(400).json({ success: false, error: 'Invalid action' });
        }
    
        if (updatedQuantity < 1 || updatedQuantity > stockLimit && action=="1") {
          return res.status(400).json({ success: false, error: 'Quantity exceeds stock limits' });
        }
    
        cart.item[itemIndex].quantity = updatedQuantity;
    
        
        const newProductTotal = price * updatedQuantity;
        cart.item[itemIndex].total = newProductTotal;
        const total = cart.item.reduce((acc, item) => acc + item.total, 0);
        console.log("total", total);
        console.log("itens total:",newProductTotal);
        cart.total = total;
        await cart.save();
    
        res.json({
          success: true,
          newQuantity: updatedQuantity,
          newProductTotal,
          total: total,
        });
    } catch (error) {
        console.log(error);
        res.send(error)       
    }
}


const checkoutpage = async (req, res) => {
    try {
      
      const categories = await catModel.find();
      const cartId = req.query.cartId;
      const userId = req.session.userId;
      const user = await userModel.findById(userId);
      const availableCoupons = await couponModel.find({
        couponCode: { $nin: user.usedCoupons },
        status:true
      });
      console.log("coupons",availableCoupons);
  
  
      const addresslist = await userModel.findOne({ _id: userId });
  
      if (!addresslist) {
        console.log('User not found');
        return res.status(404).send('User not found');
      }
  
      const addresses = addresslist.address;
  
      const cart = await cartModel.findById(cartId).populate('item.productId')
  
      for (const cartItem of cart.item || []) {
        const product = await productModel.findById(cartItem.productId);
        
        
        if (cartItem.quantity > product.stock) {
          
          console.log('Selected quantity exceeds available stock for productId:', cartItem.productId);
          const nonitemid= cartItem.productId
          const theitem=await productModel.findOne({_id:nonitemid})
          const nameitem = theitem.name
          return res.render('user/cart',{cart,categories,message:` The product ${nameitem}'s quantity Exceeds StockLimit..!!`})
        
        }
        
      }
      
  
      const cartItems = (cart.item || []).map((cartItem) => ({
        productId:cartItem.productId._id,
        productName: cartItem.productId.name,
        price:cartItem.productId.price,
        quantity: cartItem.quantity,
        itemTotal: cartItem.total,
      }));
  
      
  
      console.log('Cart Total:', cart.total);
  
      res.render('user/checkout', {availableCoupons, addresses, cartItems, categories, cart,cartId });
    
    
  }catch(err) {
      console.error(err);
      res.status(500).send('Error occurred');
    }
  };


        

module.exports={
    showcart,
    addtocart,
    deletecart,
    updatecart,
    checkoutpage
}