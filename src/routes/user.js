const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const route = express.Router()
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            cb(new Error('Please upload image'))
        }
        cb(undefined, true)
    }
})

//create users
route.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {

        res.status(400).send(e)
    }
})

route.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})


//get all users
route.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.send(e)
    }
})

route.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token //will remove token in req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

route.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//update user data
route.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body) //converts keys in object to array of strings
    const allowedUpdates = ['name', 'email', 'age', 'password']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update" })
    }

    try {
        let user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save() //this is done to call middleware
        // let user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) //new will return updated data, validator will run validation which we have set

        res.status(201).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

route.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    //this function is used to handle error messages
    //it needs to have exact parameters
    res.status(400).send({ error: error.message })
})

route.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


route.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete user
route.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(400).send()
        // }
        await req.user.remove() // deletes user
        res.status(201).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = route