require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const bodyParser = require('body-parser')

// database
const connectDB = require('./config/connectDB');

//routers
const authRoutes = require('./routes/authRoutes');

// middlewares
app.use(express.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use('/api/v1/auth', authRoutes);


const port = process.env.PORT || 5000;

const startApp = async () => {
try{
	await connectDB(process.env.MONGO_URL)
	app.listen(port, () => console.log(`Server is listen on port ${port}`)
)
} catch(error){
	console.log(error);
}
}
 startApp()
