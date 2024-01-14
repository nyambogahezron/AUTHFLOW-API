require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// database
const connectDB = require('./config/connectDB')


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
