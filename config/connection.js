const mongoose=require("mongoose")

// database connecting 
const connect=async()=>{
    try {
        mongoose.connect("mongodb://127.0.0.1:27017/timezone")
        .then(console.log("Mongo db connected"))
        .catch((err)=>console.log(err))
    } catch (error) {
        console.log(error);
        res.send(error)
    }

}
module.exports={
    connect
}