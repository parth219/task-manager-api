const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }
        //since we have already found user we don't want to again find user
        // res.send(user)
        req.user = user //we can use any variable name
        req.token = token
        next()
    } catch (e) {
        res.status(400).send({ error: "Please authenticate." })
    }
}

module.exports = auth