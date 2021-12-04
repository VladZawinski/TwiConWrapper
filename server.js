const express = require('express')
const app = express();
const mongoose = require('mongoose')
require('dotenv').config()


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch(err => console.log(err))

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const chatRoute = require('./routes/chat')

const verifyToken = require('./middlewares/auth')

app.use('/api/list', verifyToken , userRoute)
app.use('/api/user', authRoute);
app.use('/api/chat', verifyToken, chatRoute)


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started running at ${port}`);
})