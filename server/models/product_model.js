// module importing 
const mongoose=require("mongoose")
const Schema=mongoose.Schema


// schema structuring 
const productSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'categories', 
      required: true,
  },
  
  price:{
        type:Number,
        required:true
    },
    
    images: {
    type:Array,
    required:true,
    },
    stock: {
  
          type: Number,
          required: true,
      
      },
      status:{
        type:Boolean,
        default:true,
      },
    description:{
        type:String,
        required:true
    }
    
})

// model creating 
const productModel=new mongoose.model("products",productSchema)

// module exporting 
module.exports=productModel