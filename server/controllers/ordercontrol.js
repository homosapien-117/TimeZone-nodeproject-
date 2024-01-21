const orderModel=require("../models/ordermodel")
const easyinvoice = require('easyinvoice')


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

const downloadInvoice = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      console.log(orderId);
      const order = await orderModel.findOne({ orderId: orderId }).populate({
        path: "items.productId",
        select: "name",
      });
      console.log("jfthgcxfdshgdfrtc",order);
      const pdfBuffer = await generateInvoice(order);
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        ` attachment; filename=invoice-${order.orderId}.pdf`
      );
      res.send(pdfBuffer);
      
  
    }
    
     catch (error) {
      console.log(error);
      res.send(error);
    }
  };
  
  const generateInvoice=async (order)=>{
    try{
      console.log("kayari");
      let totalAmount = order.totalPrice;
      const data = {
        documentTitle: "Invoice",
        currency: "INR",
        marginTop: 25,
        marginRight: 25,
        marginLeft: 25,
        marginBottom: 25,
        sender: {
          company: "TimeZone",
          address: "123 Main Street, Banglore, India",
          zip: "651323",
          city: "Banglore",
          country: "INDIA",
          phone: "9605337832",
          email: "timeZone.com",
          website: "www.TimeZone.online",
        },
        invoiceNumber: "INV-${order.orderId}",
        invoiceDate: new Date().toJSON(),
        products: order.items.map((item) => ({
          quantity: item.quantity,
          description: item.productName,
          price: item.price,
        })),
  
        total: parseInt(totalAmount),
        tax: 0,
        bottomNotice: "Thank you for shopping at UrbanSole!",
      };
    const result = await easyinvoice.createInvoice(data);
    const pdfBuffer = Buffer.from(result.pdf, "base64");
  
    return pdfBuffer;
  }catch(error){
      console.log(error);
  }
  
  
  }

module.exports={
    orderPage,
    updateorderstatus,
    downloadInvoice,
    generateInvoice
}