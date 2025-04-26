const express = require('express');
const app = express()

const cors =require('cors');
const helmet=require('helmet');
const cookieparser =require ('cookie-parser');
const mongoose=require('mongoose');
const authRouter=require('./router/authRouter');



app.use(cors());
app.use (helmet());
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))





mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('database connected')
})
.catch((error)=>{
    console.log("Database connection failed:", error.message);

});

app.use('/api/auth',authRouter);
app.get('/',(req,res)=>{
    res.json({Message:"hello from the server"});
});

app.listen(process.env.PORT,()=>{
    console.log('listening.......')
})