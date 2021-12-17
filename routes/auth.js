const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const chat = require('../controller/chat')

router.post('/register', async (req,res) => {
    const { name, password, email} = req.body;
    console.log(`${name} and ${password} ${email}`);
    try {
        const isExist = await User.findOne({ email });

        if(isExist){
            return res.json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        let user = await User.create({
            name,password: hashedPassword,email
        });

        let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 360000 });

        return res.json({
            message: 'User created successfully!',
            token: token
        });

    } catch (error) {
        console.log(error)
    }
    
});

router.post('/login', async (req,res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email })

        if(!user){
            return res.json({
                message: 'User does not exists!'
            })
        }

        const isPasswordMatch = await bcrypt.compare(password,user.password);

        if(!isPasswordMatch){
            return res.json({
                message: 'Incorrect password!'
            })
        }

        let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 360000 });
        let chatToken = await chat.generateChatToken(user._id)

        return res.json({
            message: 'Login success!',
            token: token,
            chatToken
        });
        
    } catch (error) {
        console.log(error);
    }
});
 
module.exports = router;