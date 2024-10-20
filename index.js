const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;

app.get('/' , (req,res)=>{
    res.send(`Artifex Server is running on port ${port}`);
})

app.listen (port, ()=>{
    console.log("Server is running on port 3000");
    
})


