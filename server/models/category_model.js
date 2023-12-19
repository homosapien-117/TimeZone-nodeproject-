// module importing 
const mongoose=require("mongoose")

// schema structuring 
const catSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true,
        required:true
    }
})

// model creating 
const catModel=new mongoose.model("categories",catSchema)


// module exporting 
module.exports=catModel