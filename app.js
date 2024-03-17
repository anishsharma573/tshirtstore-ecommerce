const express = require('express');
require('dotenv').config() 
const app = express();
const morgan = require('morgan')
//morgan middleware
app.use(morgan('tiny'))
const cookieParser = require("cookie-parser")
const fileUpload = require('express-fileupload')

//regular middleware

app.use(express.json())
app.use(express.urlencoded({extended:true})) //. The extended: true option allows for parsing of nested objects in the URL-encoded data.
//cookie and file upload middleware



app.use(cookieParser())
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//temp check
app.set("view engine","ejs")
// import all routes here
const home = require('./routes/home')
const user = require("./routes/user")
const product = require('./routes/product')
const payment = require('./routes/payment')
const order = require('./routes/order')
//router middleware

app.use('/api/v1',home)
app.use("/api/v1",user)
app.use("/api/v1",product)
app.use("/api/v1",payment)
app.use("/api/v1",order)
app.get("/signuptest",(req,res)=>{
    res.render('signuptest')
})
//export app js
module.exports=app;