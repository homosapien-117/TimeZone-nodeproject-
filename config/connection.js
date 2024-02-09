const mongoose=require("mongoose")

// database connecting 
const connect=async()=>{
    try {
        mongoose.connect("mongodb+srv://ajay:MSDkg2Qj!RfsdH%40ajay@cluster0.9h4agsu.mongodb.net/timezone")
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