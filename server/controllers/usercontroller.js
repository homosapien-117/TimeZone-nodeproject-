

const bcrypt=require('bcrypt')
const otpgenerator=require('otp-generator')
const nodemailer=require('nodemailer')

const userModel=require('../models/usermodel')
const otpModel=require('../models/otpmodel')
const { Email, pass } = require('dotenv').config({path: '../.env'})
const catModel=require('../models/category_model')
const productModel=require('../models/product_model')


const {
  emailValid,
  nameValid,
  phoneValid,
  passwordValid,
  confirmpasswordValid
  } = require ("../../utils/validators/signup_validators");

// usrouter.use(express.urlencoded({extended:true}))


// otp generating function 
const generateotp = () => {
    const otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    console.log("Generated OTP:", otp);
    return otp;
  };


// otp email sending function 
const sendmail = async (email, otp) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ajaykrishna2000117@gmail.com", 
        pass: "lydw qgzv dxkb kkwt" 
      },
    });

    var mailOptions = {
      from: "<ajaykrishna2000117@gmail.com>",
      to: email,
      subject: "E-Mail Verification",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Error in sending mail:", err);
  }
};





//index page
const index = async (req, res) => {
  try {
    const categories = await catModel.find();
    console.log(categories);
    res.render("user/index", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

//shop page
const shop = async (req, res) => {
  try {
    const category = req.query.category;

    const products = await productModel
      .find({ $and: [{ category }, { status: true }] })
      .exec();
    const categories = await catModel.find();
    const ctCategory = categories.find(
      (cat) => cat._id.toString() === category
    );

    const categoryName = ctCategory ? ctCategory.name : null;

    res.render("user/shop", {
      categoryName,
      categories,
      products,
      selectedCategory: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("error occured");
  }
};


//login page
const login=(req,res)=>{
    res.render('user/userlogin')
}

// login verification
const verifylogin = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await userModel.findOne({ username: username });

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    const passwordmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (passwordmatch && !user.status) {
      // Authentication successful
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.isAuth = true;
      res.redirect("/");
    } else {
      // Authentication failed
      res.render("user/userlogin", { passworderror: "incorrect password" });
    }
  } catch (error) {
    // Error occurred, could be due to user not found or other issues
    res.render("user/userlogin", { username: "incorrect username" });
  }
};

//forgot password rendering
const forgot = async (req, res) => {
  try {
    res.render("user/forgot");
  } catch {
    res.status(200).send("error occured");
  }
};


//forgot pass email checking and otp generating
const resetpassword = async (req, res) => {
  try {
    const email = req.body.email;
    const emailexist = await userModel.findOne({ email: email });
    // req.session.id=emailexist._id
    console.log(emailexist);
    if (emailexist) {
      req.session.forgot = true;
      req.session.signup = false;
      req.session.user = { email: email };
      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 60 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);

      await sendmail(email, otp);
      res.redirect("/signupotp");
    } else {
      res.render("user/forgot", { email: "E-Mail Not Exist" });
    }
  } catch (err) {
    res.status(400).send("error occurred: " + err.message);
    console.log(err);
  }
};


//reset password rendering page
const reenterpassword = async (req, res) => {
  try {
      res.render("user/reenterpassword");
  } catch {
    res.status(400).send("error occured");
  }
};

// reset password confrimation
const confirm_password = async (req, res) => {
  try {
      const password = req.body.newPassword;
      const cpassword = req.body.confirmPassword;

      const ispasswordValid = passwordValid(password);
      const iscpasswordValid = confirmpasswordValid(cpassword, password);

      if (!ispasswordValid) {
        res.render("user/reenterpassword", {
          perror: "Password should contain (A,a,@)",
        });
      } else if (!iscpasswordValid) {
        res.render("user/reenterpassword", { cperror: "Passwords not match" });
      } else {
        const hashedpassword = await bcrypt.hash(password, 10);
        const email = req.session.user.email;
        await userModel.updateOne(
          { email: email },
          { password: hashedpassword }
        );
        req.session.forgot = false;
        res.redirect("/login");
      }
  } catch {
    res.status(400).send("error occured");
  }
};

//signup page
const signup = async (req, res) => {
    res.render('user/signup')
}

// signup post 
const signin= async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const cpassword = req.body.confirm_password;

    console.log('Username:', username);
  console.log('Email:', email);
  console.log('Phone:', phone);
  console.log('Password:', password);
  console.log('Confirm Password:', cpassword);

    const isusernameValid = nameValid(username);
    const isEmailValid = emailValid(email);
    const isPhoneValid = phoneValid(phone);
    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    const emailExist = await userModel.findOne({ email: email });
    if (emailExist) {
      res.render("user/signup", { emailerror: "E-mail already exits" });
    } else if (!isusernameValid) {
      res.render("user/signup", { nameerror: "Enter a valid Name" });
    } else if (!isEmailValid) {
      res.render("user/signup", { emailerror: "Enter a valid E-mail" });
    } else if (!isPhoneValid) {
      res.render("user/signup", { phoneerror: "Enter a valid Phone Number" });
    } else if (!ispasswordValid) {
      res.render("user/signup", {
        passworderror: "Password should contain one(A,a,2)",
      });
    } else if (!iscpasswordValid) {
      res.render("user/signup", {
        cpassworderror: "Password and Confirm password should be match",
      });
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const user = new userModel({
        username: username,
        email: email,
        phone: phone,
        password: hashedpassword,
      });

      req.session.user = user;
      req.session.signin = true;
      req.session.forgot = false;

      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 30 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);
      await sendmail(email, otp);
      res.render("user/signupotp");
    } 
  }
     catch (err) {
    console.error("Error:", err);
    res.send("error");
  }
};



  // otp page rendering 
const signupotp = async (req, res) => {
    try {
        res.render("user/signupotp");
    } catch {
      res.status(200).send("error occured");
    }
  };


  // otp verifying page 
  
  const verifyotp = async (req, res) => {
    try {
      const enteredotp = req.body.otp;
      const user = req.session.user;
      const email = req.session.user.email;
      
      const userdb = await otpModel.findOne({ email: email });
      const otp = userdb.otp;
      const expiry = userdb.expiry;
      
      if (enteredotp == otp && expiry.getTime() >= Date.now()) {
        user.isVerified = true;
        try {
          if (req.session.signin) {
            await userModel.create(user);
            req.session.signin = false;
            res.redirect("/login");
          } else if (req.session.forgot) {
            res.redirect("/reenterpassword");
          }
        } catch (error) {
          console.error(error);
          res.status(500).send("Error occurred while saving user data");
        }
      } else {
        res.render("user/signupotp", { otperror: "Wrong password/Time expired" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error occurred");
    }
  };
  
  //resend otp
  const resendotp = async (req, res) => {
    try {
      console.log("resend otp is working");
        const email = req.session.user.email;
        const otp = generateotp();
        console.log(otp);
  
        const currentTimestamp = Date.now();
        const expiryTimestamp = currentTimestamp + 30 * 1000;
        await otpModel.updateOne(
          { email: email },
          { otp: otp, expiry: new Date(expiryTimestamp) }
        );
        await sendmail(email, otp);
      
    } catch (err) {
      console.log(err);
    }
  };

  // user profile page 
  const profile = async (req, res) => {
    try {
        const categories = await catModel.find();
        const id = req.session.userId;
        const user = await userModel.findOne({ _id: id }); // Assuming you want to find the first user
        console.log(user.username);
        const name = user.username;
        res.render("user/profile", { categories, name });
        console.log(req.session.user);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };



//logout
const logout = async (req, res) => {
  try {
    
      req.session.isAuth = false;
      req.session.destroy();
      res.redirect("/");
    
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};



module.exports={
    index,
    login,
    signup,
    signin,
    signupotp,
    verifylogin,
    verifyotp,
    resendotp,
    forgot,
    resetpassword,
    reenterpassword,
    confirm_password,
    profile,
    logout,
    shop
}