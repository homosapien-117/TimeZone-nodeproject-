const adminmodel = require("../models/usermodel");
const categoryModel = require("../models/category_model");
const bcrypt = require("bcrypt");



// admin login page
const login = async (req, res) => {
    try {
      res.render("admin/adminlogin.ejs");
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };


  // admin login action 
const adminlogin = async (req, res) => {
    try {
      const trues = "true";
      const user = await adminmodel.findOne({ isAdmin: trues });
      const passwordmatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      console.log(user.password);
      if (passwordmatch) {
        console.log("admin is in");
        req.session.isadAuth = true;
        res.redirect("/admin/adminpannel");
      } else {
        console.log("username mismatch");
        res.render("admin/adminlogin", { passworderror: "invalid password" });
      }
    } catch (error) {
      console.log(error);
      res.render("admin/adminlogin", { username: "incorrect username" });
    }
  };


  const adminpannel = async (req, res) => {
    try {
      res.render("admin/adminpannel");
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };

  // admin logout 
const adlogout = async (req, res) => {
  try {
      req.session.isadAuth = false;
      req.session.destroy();
  
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// admin userlist 
const userslist = async (req, res) => {
  try {
      const user = await adminmodel.find({isAdmin:false});
      // console.log(user);
      res.render("admin/userlist", { users: user });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin user update 
const userupdate = async (req, res) => {
  try {
      const email = req.params.email;
      const user = await adminmodel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.status = !user.status;
      if(user.status)
      {
        req.session.isAuth=false;
      }

      await user.save();
      res.redirect("/admin/userslist");
   
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin searchuser 
const searchuser = async (req, res) => {
  try {
      const searchName = req.body.search;
      const data = await adminmodel.find({
        username: { $regex: new RegExp(`^${searchName}`, `i`) },isAdmin:false
      });
      req.session.searchuser = data;
      res.redirect("/admin/searchview");
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin searchview 
const searchview = async (req, res) => {
  try {
      const user = req.session.searchuser;
      res.render("admin/userlist", { users: user,isAdmin:false });
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin sorting 
const filter = async (req, res) => {
  try {
      const option = req.params.option;
      if (option === "A-Z") {
        user = await adminmodel.find({isAdmin:false}).sort({ username: 1 });
      } else if (option === "Z-A") {
        user = await adminmodel.find({isAdmin:false}).sort({ username: -1 });
      } else if (option === "Blocked") {
        user = await adminmodel.find({ status: true ,isAdmin:false});
      } else {
        user = await adminmodel.find({isAdmin:false});
      }
      res.render("admin/userlist", { users: user });
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin category 
const category = async (req, res) => {
  try {
      const category = await categoryModel.find({});
      res.render("admin/categories", { cat: category });
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin new category page
const newcat = async (req, res) => {
  try {
      res.render("admin/addcategories");
   
  } catch (error) {
    console.log(error);
  }
};

// admin new category adding 
const addcategory = async (req, res) => {
  try {
      const catName = req.body.categoryName;
      const catdes = req.body.description;
      const existingCategory = await categoryModel.findOne({ name:catName });
      if (existingCategory) {
        res.render("admin/addcategories", { categoryerror: "category allready exist" })
      }
      else{
      await categoryModel.insertMany({ name: catName, description: catdes });
      res.redirect("/admin/category");
    }
   
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin category unlisting 
const unlistcat = async (req, res) => {
  try {
      const id = req.params.id;
      const category = await categoryModel.findOne({ _id: id });
      category.status = !category.status;
      await category.save();
      res.redirect("/admin/category");
   
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin category update page
const updatecat = async (req, res) => {
  try {
      const id = req.params.id;
      const cat = await categoryModel.findOne({ _id: id });
      res.render("admin/updatecat", { itemcat: cat });
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// admin category updating
const updatecategory = async (req, res) => {
  try {
      const id = req.params.id;
      const catName = req.body.categoryName;
      const catdec = req.body.description;
      await categoryModel.updateOne(
        { _id: id },
        { name: catName, description: catdec }
      );
      res.redirect("/admin/category");
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

  module.exports={
login,
adminlogin,
adminpannel,
adlogout,
userslist,
userupdate,
searchuser,
searchview,
filter,
category,
newcat,
addcategory,
unlistcat,
updatecat,
updatecategory
}