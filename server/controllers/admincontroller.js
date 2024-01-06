const adminmodel = require("../models/usermodel");
const categoryModel = require("../models/category_model");
const bcrypt = require("bcrypt");
const orderModel=require("../models/ordermodel")
const ExcelJS = require('exceljs')
const puppeteer=require('puppeteer')
const fs=require('fs')
const os=require('os')
const path=require('path')



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


const chartData=async(req,res)=>{
  try {
      const selected=req.body.selected
      console.log(selected);
      if(selected=='month'){
          const orderByMonth= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          month:{$month:'$createdAt'},
                      },
                      count:{$sum:1},
                  }
              }
          ])
          const salesByMonth= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          month:{$month:'$createdAt'},
                      },
                      totalAmount: { $sum: '$totalPrice' },
                      
                  }
              }
          ])
          console.log('order2',orderByMonth);
          console.log('sales2',salesByMonth);
          const responseData = {
              order: orderByMonth,
              sales: salesByMonth
            };
            
            
            res.status(200).json(responseData);
      }
      else if(selected=='year'){
          const orderByYear= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          year:{$year:'$createdAt'},
                      },
                      count:{$sum:1},
                  }
              }
          ])
          const salesByYear= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          year:{$year:'$createdAt'},
                      },
                      totalAmount: { $sum: '$totalPrice' },
                  }
              }
          ])
          console.log('order1',orderByYear);
          console.log('sales1',salesByYear);
          const responseData={
              order:orderByYear,
              sales:salesByYear,
          }
          res.status(200).json(responseData);
      }
      
    }
  catch(err){
    console.log(err);
    res.send("Error Occured")
}

}

const downloadsales = async (req, res) => {
  try {
      const { startDate, endDate } = req.body;

      const salesData = await orderModel.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(startDate),
                      $lt: new Date(endDate),
                  },
              },
          },
          {
              $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalAmount: { $sum: '$totalPrice' },
              },
          },
      ]);

      const products = await orderModel.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(startDate),
                      $lt: new Date(endDate),
                  },
              },
          },
          {
              $unwind: '$items',
          },
          {
              $group: {
                  _id: '$items.productId',
                  totalSold: { $sum: '$items.quantity' },
              },
          },
          {
              $lookup: {
                  from: 'products',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'productDetails',
              },
          },
          {
              $unwind: '$productDetails',
          },
          {
              $project: {
                  _id: 1,
                  totalSold: 1,
                  productName: '$productDetails.name',
              },
          },
          {
              $sort: { totalSold: -1 },
          },
      ]);
      const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Sales Report</title>
              <style>
                  body {
                      margin-left: 20px;
                  }
              </style>
          </head>
          <body>
              <h2 align="center"> Sales Report</h2>
              Start Date:${startDate}<br>
              End Date:${endDate}<br>
              <center>
                  <table style="border-collapse: collapse;">
                      <thead>
                          <tr>
                              <th style="border: 1px solid #000; padding: 8px;">Sl N0</th>
                              <th style="border: 1px solid #000; padding: 8px;">Product Name</th>
                              <th style="border: 1px solid #000; padding: 8px;">Quantity Sold</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${products.map((item, index) => `
                              <tr>
                                  <td style="border: 1px solid #000; padding: 8px;">${index + 1}</td>
                                  <td style="border: 1px solid #000; padding: 8px;">${item.productName}</td>
                                  <td style="border: 1px solid #000; padding: 8px;">${item.totalSold}</td>
                              </tr>`).join('')}
                              <tr>
                              <td style="border: 1px solid #000; padding: 8px;"></td>
                              <td style="border: 1px solid #000; padding: 8px;">Total No of Orders</td>
                              <td style="border: 1px solid #000; padding: 8px;">${salesData[0].totalOrders}</td>
                          </tr>
                          <tr>
                              <td style="border: 1px solid #000; padding: 8px;"></td>
                              <td style="border: 1px solid #000; padding: 8px;">Total Revenue</td>
                              <td style="border: 1px solid #000; padding: 8px;">${salesData[0].totalAmount}</td>
                          </tr>
                      </tbody>
                  </table>
              </center>
          </body>
          </html>
      `;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      // Generate PDF
      const pdfBuffer = await page.pdf();

      await browser.close();

      const downloadsPath = path.join(os.homedir(), 'Downloads');
      const pdfFilePath = path.join(downloadsPath, 'sales.pdf');

      // Save the PDF file locally
      fs.writeFileSync(pdfFilePath, pdfBuffer);

      // Send the PDF as a response
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales.pdf');
      res.status(200).end(pdfBuffer);
  } catch (err) {
      console.error(err);
      res.status(500).send(err.message || 'Internal Server Error');
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
updatecategory,
chartData,
downloadsales
}