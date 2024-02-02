const bannerModel=require('../models/banner_model')
const catModel=require('../models/category_model')
const productModel=require('../models/product_model')
const couponModel = require('../models/coupon_model')
const { default: mongoose } = require('mongoose')


const bannerList=async(req,res)=>{
    try {
        const banners=await bannerModel.find({})
        console.log(banners);
        res.render("admin/bannerList",{banners:banners})
        
    } catch (error) {
        console.log(error);
        res.render("user/serverError");

        
    }
}

const addbanner=async(req,res)=>{
    try {
        const[categories,products,coupons]=await Promise.all([
            catModel.find(),
            productModel.find(),
            couponModel.find()
        ])

        res.render("admin/newBanner",{categories,products,coupons})
        
    } catch (error) {
        console.log(err);
        res.render("user/serverError");
    }
}

const addBannerPost = async (req, res) => {
    try {
        console.log("evide vann");
       const { bannerLabel, bannerTitle, bannerSubtitle, bannerColor } = req.body;
   
       let bannerLink;
       let category = null; 
       let product = null;
       if (bannerLabel === 'category') {
         bannerLink = req.body.category;
         
         console.log(category);
       } else if (bannerLabel === 'product') {
         bannerLink = req.body.product;
         
       } else if (bannerLabel === 'coupon') {
         bannerLink = req.body.coupon;
         
       } else {
         bannerLink = 'general';
       }
   
       if (!req.file) {
         throw new Error('No image was uploaded.');
       }
   
       const newBanner = new bannerModel({
         label: bannerLabel,
         title: bannerTitle,
         subtitle: bannerSubtitle,
   
         image: {
           public_id: req.file.filename,
           url: `/uploads/${req.file.filename}`,
         },
         color: bannerColor,
         bannerLink: bannerLink,
         category: category ,
         product: product
       });
   
       await newBanner.save();
       const banners = await bannerModel.find();
       res.render("admin/bannerList", { banners: banners });
    } catch (error) {
       console.log(error);
       res.render("user/serverError");
    }
   };

const unlistBanner=async(req,res)=>{
    try {
        const id=req.params.id;
        const banner=await bannerModel.findOne({_id:id});
        banner.active = !banner.active;
        await banner.save();
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error);
        res.render("user/serverError");
    }
}

const updateBanner=async(req,res)=>{
    try {
        const id = req.params.id
        const banner = await bannerModel.findOne({ _id: id });
        const categories=await catModel.find();
        const products=await productModel.find();
        const coupons=await couponModel.find();
        res.render('admin/updateBanner',{banner,categories,products,coupons})

        
    } catch (error) {
        console.log(error);
        res.render("user/serverError");
        
    }
}

const updateBannerPost=async(req,res)=>{
    try {
        const id = req.params.id
        const { bannerLabel,bannerTitle,bannerSubtitle,bannerImage } = req.body
        console.log("the file is here",req.file);
        const banner=await bannerModel.findOne({_id:id})

        let bannerLink;

        if(bannerLabel=="category"){
            bannerLink=req.body.category
           }
           else if(bannerLabel=="product"){
            bannerLink=req.body.product
           }
           else if(bannerLabel=="coupon"){
            bannerLink=req.body.coupon
           }
           else{
            bannerLink="general"
           }


        banner.bannerlink=bannerLink;
        banner.label = bannerLabel;
        banner.title = bannerTitle;
        banner.subtitle = bannerSubtitle;
        banner.color=req.body.bannerColor
        if (req.file) {
            banner.image = {
            public_id: req.file.filename, 
            url: `/uploads/${req.file.filename}` 
        }
    }

        await banner.save()
        res.redirect('/admin/bannerList')
        } catch (error) {
        console.log(error);
        res.render("user/serverError");
    }
}

const deleteBanner=async(req,res)=>{
    try {
        const id=req.params.id;
        const deletedBanner = await bannerModel.findByIdAndDelete(id)
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error)
        res.render("user/serverError");
        
    }
}





module.exports={
    bannerList,
    addbanner,
    addBannerPost,
    unlistBanner,
    updateBanner,
    updateBannerPost,
    deleteBanner

}