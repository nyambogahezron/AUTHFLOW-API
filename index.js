require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();



const port = process.env.PORT || 5000;

const startApp = async () => {
try{
	app.listen(port, () => console.log(`Server is listen on port ${port}`)
)
} catch(error){
	console.log(error);
}
}
 startApp()
