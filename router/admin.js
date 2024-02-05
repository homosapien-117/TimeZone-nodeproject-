const express = require("express");
const multer = require("multer");
const session = require("express-session");
const admincontroller = require("../server/controllers/admincontroller");
const adminrouter = express.Router();
const productcontroller = require("../server/controllers/productcontroller");
const sessions = require("../middleware/isadAuth");
const ordercontroller = require("../server/controllers/ordercontrol");
const couponcontroller = require("../server/controllers/couponcontroller");
const bannercontroller = require("../server/controllers/bannercontroller");
const upload = multer({ dest: "uploads/" });
const { copy } = require("./user")
const app = express();

app.use(express.static("public/admin_assets"));
adminrouter.use(express.urlencoded({ extended: true }));

adminrouter.get("/", admincontroller.login);
adminrouter.post("/adminlogin", admincontroller.adminlogin);

adminrouter.get("/adminpannel", sessions.adisAuth, admincontroller.adminpannel);
adminrouter.get("/userslist", sessions.adisAuth, admincontroller.userslist);
adminrouter.get(
  "/update/:email",
  sessions.adisAuth,
  admincontroller.userupdate
);
adminrouter.post("/searchuser", sessions.adisAuth, admincontroller.searchuser);
adminrouter.get("/searchview", sessions.adisAuth, admincontroller.searchview);
adminrouter.get("/filter/:option", sessions.adisAuth, admincontroller.filter);

adminrouter.get("/adlogout", sessions.adisAuth, admincontroller.adlogout);

adminrouter.get("/category", sessions.adisAuth, admincontroller.category);
adminrouter.get("/newcat", sessions.adisAuth, admincontroller.newcat);
adminrouter.post(
  "/add-category",
  sessions.adisAuth,
  admincontroller.addcategory
);
adminrouter.get("/unlistcat/:id", sessions.adisAuth, admincontroller.unlistcat);
adminrouter.get("/updatecat/:id", sessions.adisAuth, admincontroller.updatecat);
adminrouter.post(
  "/update-category/:id",
  sessions.adisAuth,
  admincontroller.updatecategory
);

adminrouter.get("/product", sessions.adisAuth, productcontroller.product);
adminrouter.get("/newproduct", sessions.adisAuth, productcontroller.newproduct);
adminrouter.post(
  "/addproduct",
  sessions.adisAuth,
  upload.array("images"),
  productcontroller.addproduct
);
adminrouter.get("/unlist/:id", sessions.adisAuth, productcontroller.unlist);
adminrouter.get(
  "/deletepro/:id",
  sessions.adisAuth,
  productcontroller.deleteproduct
);
adminrouter.get(
  "/updatepro/:id",
  sessions.adisAuth,
  productcontroller.updatepro
);
adminrouter.get("/editimg/:id/", sessions.adisAuth, productcontroller.editing);
adminrouter.get("/deleteimg", sessions.adisAuth, productcontroller.deleteimg);
adminrouter.post(
  "/updateimg/:id",
  sessions.adisAuth,
  upload.array("images"),
  productcontroller.updateimg
);
adminrouter.get('/resizeimg',sessions.adisAuth,productcontroller.resizeImage)

adminrouter.post(
  "/updateproduct/:id",
  sessions.adisAuth,
  productcontroller.updateproduct
);

adminrouter.get("/orderPage", sessions.adisAuth, ordercontroller.orderPage);
adminrouter.post(
  "/updateOrderStatus",
  sessions.adisAuth,
  ordercontroller.updateorderstatus
);
adminrouter.get("/orderDetails/:id",ordercontroller.orderDetails)

adminrouter.get("/couponList", sessions.adisAuth, couponcontroller.couponList);
adminrouter.get(
  "/newcoupon",
  sessions.adisAuth,
  couponcontroller.addcouponpage
);
adminrouter.post(
  "/add_coupon",
  sessions.adisAuth,
  couponcontroller.createCoupon
);
adminrouter.get(
  "/unlistCoupon/:id",
  sessions.adisAuth,
  couponcontroller.unlistCoupon
);
adminrouter.get(
  "/editCouponGet/:id",
  sessions.adisAuth,
  couponcontroller.editCouponPage
);
adminrouter.post(
  "/updateCoupon",
  sessions.adisAuth,
  couponcontroller.updateCoupon
);

adminrouter.post("/chartData", sessions.adisAuth, admincontroller.chartData);
adminrouter.post(
  "/downloadsales",
  sessions.adisAuth,
  admincontroller.downloadsales
);

adminrouter.get("/bannerList", sessions.adisAuth, bannercontroller.bannerList);
adminrouter.get("/newbanner", sessions.adisAuth, bannercontroller.addbanner);
adminrouter.post(
  "/addBanner",
  upload.single("image"),
  sessions.adisAuth,
  bannercontroller.addBannerPost
);
adminrouter.get('/unlistBanner/:id',sessions.adisAuth,bannercontroller.unlistBanner)
adminrouter.get(
  "/updateBanner/:id",
  sessions.adisAuth,
  bannercontroller.updateBanner
);
adminrouter.post(
  "/updateBannerPost/:id",
  upload.single("newImage"),
  sessions.adisAuth,
  bannercontroller.updateBannerPost
);
adminrouter.get(
  "/deleteBanner/:id",
  sessions.adisAuth,
  bannercontroller.deleteBanner
);

module.exports = adminrouter;
