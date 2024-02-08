require('dotenv').config();
require('express-async-errors');
const path = require('path')
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const cors = require('cors');


// database
const connectDB = require('./config/connectDB');

//routers
const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

// middlewares
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const asyncHandlerMiddleware = require('./middleware/asyncHandler');


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: false}))

app.use(cookieParser(process.env.JWT_SECRET));

const corsOptions = {
  origin: 'https://authflow-app-rho.vercel.app',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
app.use(asyncHandlerMiddleware);

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
