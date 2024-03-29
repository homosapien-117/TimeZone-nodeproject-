const express = require("express");
const usrouter = express.Router();
const { sep } = require("path/posix");
const session = require("../middleware/isAuth");
const uscontroller = require("../server/controllers/usercontroller");
const profilecontroller = require("../server/controllers/profilecontrol");
const cartcontroller = require("../server/controllers/cartcontroller");
const checkoutcontroller = require("../server/controllers/checkoutcontroller");
const orderCountrol = require("../server/controllers/ordercontrol");
const couponControl = require("../server/controllers/couponcontroller");
const productcontroller = require("../server/controllers/productcontroller");
const { loged, signforgot, forgot, logedtohome } = session;

//index
usrouter.get("/", uscontroller.index);
// banner
usrouter.get("/bannerURL", uscontroller.bannerURL);
//pagination
usrouter.post("/pagination", uscontroller.index);

//shop
usrouter.get("/shop", uscontroller.shop);
usrouter.post("/searchProducts", uscontroller.searchProducts);
usrouter.get("/filterProducts", uscontroller.filterProducts);
usrouter.get("/sortProducts", uscontroller.sortProducts);
usrouter.get("/shoping/:id", uscontroller.shopping);

//single product
usrouter.get("/singleproduct/:id", uscontroller.singleproduct);
usrouter.get("/rateAndReview", loged, productcontroller.ratePage);

// profile
usrouter.get("/userdetails", loged, profilecontroller.userdetails);
usrouter.get("/editProfile", loged, profilecontroller.profileEdit);
usrouter.post("/updateprofile", loged, profilecontroller.profileUpdate);
usrouter.get("/newAddress", loged, profilecontroller.newAddress);
usrouter.post("/addressUpdating", loged, profilecontroller.updateAddress);
usrouter.get("/editaddress/:addressId", loged, profilecontroller.editaddress);
usrouter.get(
  "/deleteaddress/:addressId",
  loged,
  profilecontroller.deleteAddress
);
usrouter.post(
  "/updateaddress/:addressId",
  loged,
  profilecontroller.editaddressupdate
);
usrouter.get("/orderhistory", loged, profilecontroller.orderhistory);
usrouter.get("/singleorder/:id", loged, profilecontroller.singleOrderPage);
usrouter.post("/cancelorder/:id", loged, profilecontroller.ordercancelling);
usrouter.get("/returnorder/:id", loged, profilecontroller.orderReturn);
usrouter.post("/cp", loged, profilecontroller.changepassword);
usrouter.get(
  "/download-invoice/:orderId",
  loged,
  orderCountrol.downloadInvoice
);

//cart
usrouter.get("/cartpage", loged, cartcontroller.showcart);
usrouter.get("/addtocart/:id", loged, cartcontroller.addtocart);
usrouter.get("/deletcart/:id", loged, cartcontroller.deletecart);
usrouter.post(
  "/update-cart-quantity/:productId",
  session.loged,
  cartcontroller.updatecart
);
usrouter.get("/checkoutpage", loged, cartcontroller.checkoutpage);

//checkout
usrouter.post("/checkoutreload", loged, checkoutcontroller.checkoutreload);
usrouter.post("/placeorder", loged, checkoutcontroller.placeorder);
usrouter.post("/create/orderId", loged, checkoutcontroller.upi);
usrouter.post(
  "/wallettransaction",
  loged,
  checkoutcontroller.wallettransaction
);

//user login
usrouter.get("/login", signforgot, uscontroller.login);
usrouter.post("/verifylogin", uscontroller.verifylogin);
usrouter.get("/profile", loged, uscontroller.profile);

//signup
usrouter.get("/signup", uscontroller.signup);
usrouter.post("/signin", uscontroller.signin);
usrouter.get("/signupotp", signforgot, uscontroller.signupotp);
usrouter.post("/verifyotp", uscontroller.verifyotp);
usrouter.get("/resendotp", uscontroller.resendotp);

//forgot and reset
usrouter.get("/forgot", uscontroller.forgot);
usrouter.post("/resetpassword", uscontroller.resetpassword);
usrouter.get("/reenterpassword", forgot, uscontroller.reenterpassword);
usrouter.post("/confirm_password", forgot, uscontroller.confirm_password);

//favourite
usrouter.get("/favouritespage", loged, profilecontroller.favouritespage);
usrouter.get("/addtofavourites/:id", loged, profilecontroller.addtofavourite);
usrouter.get("/deletefav/:id", loged, profilecontroller.deletefav);
usrouter.get("/addtocartviafav/:id", loged, profilecontroller.addtocartviafav);

//wallet
usrouter.get("/wallet", loged, profilecontroller.wallet);
usrouter.post("/walletcreate/orderId", loged, profilecontroller.walletupi);
usrouter.post("/walletTopup", loged, profilecontroller.walletTopup);

//coupon
usrouter.get("/Rewards", loged, profilecontroller.couponsAndRewards);
usrouter.post("/applyCoupon", loged, checkoutcontroller.applyCoupon);
usrouter.post("/revokeCoupon", loged, checkoutcontroller.recokeCoupon);

//logout
usrouter.get("/logout", logedtohome, uscontroller.logout);

//exporting
module.exports = usrouter;
