// modules importing 
const productModel = require("../models/product_model");
const categoryModel = require("../models/category_model");
const fs = require("fs");
const path = require("path");


// product page rendering 
const product = async (req, res) => {
  try {
    const products = await productModel.find({}).populate({
      path: "category",
      select: "name",
    });
    res.render("admin/product", { product: products });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// new product adding product page 
const newproduct = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    console.log("categories"), categories;
    res.render("admin/newproducts", { category: categories });
  } catch (error) {}
};

// new adding product  
const addproduct = async (req, res) => {
  try {
    const { productName, parentCategory, images, stock, price, description } =
      req.body;
    console.log(
      "its yt",
      req.files.map((file) => file.path)
    );
    const newproduct = new productModel({
      name: productName,
      category: parentCategory,
      price: price,
      stock: stock,
      images: req.files.map((file) => file.path),
      description: description,
    });
    await newproduct.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// product unlisting 
const unlist = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    console.log(product);

    product.status = !product.status;
    await product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// product deleting
const deleteproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.deleteOne({ _id: id });
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// product image editing 
const editing = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    const id = req.params.id;
    const product = await productModel.findById(id);
    res.render("admin/editimg", { product: product });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// product deleting 
const deleteimg = async (req, res) => {
  try {
    const pid = req.query.pid;
    const filename = req.query.filename;
    const imagePath = path.join("uploads", filename);

    if (fs.existsSync(filename)) {
      try {
        fs.unlinkSync(filename);
        console.log("Image deleted");
        res.redirect("/admin/product");

        await productModel.updateOne(
          { _id: pid },
          { $pull: { images: filename } }
        );
      } catch (err) {
        console.log("error deleting image:", err);
        res.status(500).send("Internal Server Error");
      }
    } else {
      console.log("Image not found");
    }
  } catch (err) {
    console.log(err);
    res.send("Error Occured");
  }
};

// product image updating 
const updateimg = async (req, res) => {
  try {
    const id = req.params.id;
    const path = req;
    console.log(path);
    const newimg = req.files.map((file) => file.path);
    const product = await productModel.findById(id);
    product.images.push(...newimg);
    product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};

// product update page 
const updatepro = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    const id = req.params.id;
    const product = await productModel.findById(id);
    console.log(product);
    res.render("admin/updateproduct", { product: product ,category: categories});
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// updating the  product
const updateproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { productName, stock,parentCategory, productprice, description } = req.body;
    const product = await productModel.findOne({ _id: id });
    product.name = productName;
    product.price = productprice;
    product.stock = stock;
    product.description = description;
    product.category=parentCategory;
    await product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};

const resizeImage=async(req,res)=>{
  try {
        const pid=req.query.pid
        const filename=req.query.filename
        const imagePath=path.join(filename)
        res.render('admin/resizeImg',{imagePath})
        console.log(imagePath)
  } catch (error) {
    console.log(error);
    res.render("user/serverError");
  }

}

const ratePage = async (req, res) => {
  try {
    const { id, rating, review } = req.query;
    const userId = req.session.userId;

    const productId = id;

    const product = await productModel.findById(productId);

    if (!product) {
      res.render("user/serverError")
    }

    const existingUserRating = product.userRatings.find(
      (userRating) => userRating.userId.toString() === userId
    );

    if (existingUserRating) {
      existingUserRating.rating = rating;
      existingUserRating.review = review;
    } else {
      product.userRatings.push({ userId, rating, review });
    }

    await product.save();

    res.redirect("/orderhistory");
  } catch (err) {
    console.log(err);
    res.render("user/serverError")
  }
};

  // module exporting 
module.exports = {
  product,
  newproduct,
  addproduct,
  unlist,
  deleteproduct,
  editing,
  updatepro,
  deleteimg,
  updateimg,
  updateproduct,
  resizeImage,
  ratePage
};
