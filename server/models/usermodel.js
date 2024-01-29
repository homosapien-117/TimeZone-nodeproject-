

// module.exports=usermodel;
const mongoose = require("mongoose")


const userschema = new mongoose.Schema({
    username:{type:String,
            required:true
            },
    email:{type:String,
            required:true,
            unique:true
            },
    phone:{type:String,
            required:true
            },
    password:{type:String,
        required:true   
        },
    address: {
                type: [{
                  saveas:{type:String},
                  fullname:{type:String},
                  adname:{type:String},
                  street: { type: String},
                  pincode:{type:Number},
                  city: { type: String },
                  state:{type:String},
                  country:{type:String},
                  phonenumber:{type:Number}
                }]},
    status:{type:Boolean,
        default:false,
        required:true
        },
        isAdmin:{
                type:Boolean,
                default:false
        },
        usedCoupons:
        [{ type: String }],

        code: {
                type: String,
                required: true,
            }

});

// creating model
const usermodel=new mongoose.model("user",userschema)

module.exports=usermodel;