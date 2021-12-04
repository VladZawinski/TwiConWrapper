const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/users', async (req,res) => {
    try {
        let users = await User.find({}).select("_id name")
        res.send(users)
    } catch (error) {
        res.send(error)
    }
})

module.exports = router;