const express=require('express')
const usrouter=express.Router()
const session=require('../middleware/isAuth')
const uscontroller=require('../server/controllers/usercontroller')
const {loged,signforgot,forgot,logedtohome}=session

//index
usrouter.get('/',uscontroller.index)


//shop
usrouter.get("/shop", uscontroller.shop)

//user login
usrouter.get('/login',signforgot,uscontroller.login)
usrouter.post('/verifylogin',uscontroller.verifylogin)
usrouter.get("/profile",loged,uscontroller.profile);
//signup
usrouter.get('/signup',uscontroller.signup)
usrouter.post('/signin',uscontroller.signin)
usrouter.get('/signupotp',signforgot,uscontroller.signupotp)
usrouter.post('/verifyotp',uscontroller.verifyotp)
usrouter.get("/resendotp",signforgot,uscontroller.resendotp)
//forgot and reset
usrouter.get("/forgot",uscontroller.forgot)
usrouter.post('/resetpassword',uscontroller.resetpassword)
usrouter.get("/reenterpassword",forgot,uscontroller.reenterpassword)
usrouter.post('/confirm_password',forgot ,uscontroller.confirm_password)
//logout
usrouter.get('/logout',logedtohome,uscontroller.logout)


//exporting
module.exports=usrouter
