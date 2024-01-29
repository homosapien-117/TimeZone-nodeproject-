const catModel = require("../models/category_model");
const walletModel = require("../models/wallet_model");
const KEY_ID = process.env.KEY_ID;
const key_secret = process.env.key_secret;
const Razorpay = require("razorpay")

const wallet = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await catModel.find({});
    let user = await walletModel
      .findOne({ userId: userId })
      .sort({ "walletTransactions.date": -1 });

    if (!user) {
      user = await walletModel.create({ userId: userId });
    }

    const userWallet = user.wallet;
    console.log(user.walletTransactions);
    const usertransactions = user.walletTransactions.reverse();

    res.render("user/wallet", { categories, userWallet, usertransactions });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
const instance = new Razorpay({ key_id: KEY_ID, key_secret: key_secret });

const walletupi = async (req, res) => {
  console.log("body:", req.body);
  var options = {
    amount: 500,
    currency: "INR",
    receipt: "order_rcpt",
  };
  instance.orders.create(options, function (err, order) {
    console.log("order1 :", order);
    res.send({ orderId: order.id });
  });
};

const walletTopup = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const Amount = parseFloat(req.body.Amount);
    console.log(Amount);
    const wallet = await walletModel.findOne({ userId: userId });
    wallet.wallet += Amount;
    wallet.walletTransactions.push({
      reason: "Wallet topup",
      type: "Credited",
      amount: Amount,
      date: new Date(),
    });

    await wallet.save();
    res.redirect("/wallet");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
};

module.exports = {
  wallet,
  walletTopup,
  walletupi
};