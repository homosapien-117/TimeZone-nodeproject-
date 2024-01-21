const mongoose=require("mongoose")

const bannerSchema=new mongoose.Schema({
    title:{
        type:String,
        require:true 
    },
    subtitle:{
        type:String,
        require:true
    },

    image:{
        public_id:{
            type:String,
            require:true
        },
        url:{
            type:String,
            require:true
        }
    },
    
    label:{
        type:String,
        require:true
    },
    bannerLink:{
        type:String,
        require:true
    },
    active:{
        type:Boolean,
        default:true
    },
    color:{
        type:String,
        require:true
    },



})
const bannerModel=new mongoose.model('banners',bannerSchema)
module.exports=bannerModel