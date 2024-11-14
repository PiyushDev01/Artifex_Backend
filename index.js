const express = require('express');
const app = express();
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const razorpay = require('razorpay');
const crypto = require('crypto');   


dotenv.config();

const port = process.env.PORT || 3000;
const delhivery_api = process.env.DELHIVERY_API;
const delhivery_baseURL = process.env.DELHIVERY_BASEURL;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/' , (req,res)=>{
    res.send(`Artifex Server is running on port ${port}`);
})


app.get('/api/pin-codes', async (req, res) => {
  try {
    // Fetch data from Delhivery API
    const response = await axios.get(delhivery_baseURL, {
      params: req.query,
      headers: {
        'Authorization': `Bearer ${delhivery_api}` // Consider moving this to an environment variable for security
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Delhivery API:', error.message);
    res.status(500).json({ message: 'Error fetching data' }); // Send a more informative error response
  }
});


  //this is for mailing functionality

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465, // use 587 for TLS
  secure: true, // true for SSL (port 465), false for TLS (port 587)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD // replace with app password if using 2FA
  }
});

 app.post('/api/send-email', (req, res) => {
  const { to, subject, htmlContent } = req.body;
  
  const mailOptions = {
    from: 'artifexpiyush@gmail.com',
    to,
    subject,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    } 
    res.status(200).send('Email sent: ' + info.response);
  });

});

app.post("/order", async(req, res)=>{

  try{
       const razorpayInstance = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const options = req.body;
  const order = await razorpayInstance.orders.create(options);
  if(!order){
      return res.status(500).json({error: "Some error occured 1"});
  }
  res.json(order);
  }catch(err){
      console.log(err);
      res.status(500).json({error: "Some error occured 2"});
  }
 
})

app.post("/capture/validate", async(req, res)=>{
  const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body;
  const sha = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  //order_id + "|" + razorpay_payment_id, secret
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
     const digest = sha.digest('hex');
     if(digest !== razorpay_signature){
         return res.status(400).json({error: "Invalid signature"});
     }
     res.json({
         msg: "success",
         order_id: razorpay_order_id,
         paymentId: razorpay_payment_id 
     });
});





app.listen (port, ()=>{
    console.log(`Server is running on port ${port}`);
    
})


