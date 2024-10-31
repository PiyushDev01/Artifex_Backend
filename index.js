const express = require('express');
const app = express();
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;
const delhivery_api = process.env.DELHIVERY_API;
const delhivery_baseURL = process.env.DELHIVERY_BASEURL;

app.use(cors());
// Middleware to parse JSON requests if needed in the future
app.use(express.json());

app.get('/' , (req,res)=>{
    res.send(`Artifex Server is running on port ${port}`);
})
app.get('/home' , (req,res)=>{
    res.send(`Welcome to Artifex Server`);
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



const transporter = nodemailer.createTransport({
  service: 'gmail',
   port: 465, // use 587 for TLS
   secure: true, // true for SSL (port 465), false for TLS (port 587)
   auth: {
     user: process.env.EMAIL, // replace with your email
     pass: process.env.PASSWORD // replace with app password if using 2FA
   }
 });

 app.post('/api/send-email', (req, res) => {
  const { to, subject, htmlContent } = req.body;
  
  const mailOptions = {
    from: process.env.EMAIL,
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



app.listen (port, ()=>{
    console.log(`Server is running on port ${port}`);
    
})


