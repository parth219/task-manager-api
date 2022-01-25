const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const route = express.Router()

//create task
route.post('/task', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,  // es6 syntax will copy all its content
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//find all tasks
// /task?completed=false
// /task?limit=2&skip=3
///task?sortBy=desc or asc
route.get('/task', auth, async (req, res) => {
    let flag = false
    if (req.query.completed) {
        flag = true
    }
    //pagination
    const queryParams = {}
    if (req.query.limit) {
        queryParams.limit = parseInt(req.query.limit)
        queryParams.skip = parseInt(req.query.skip)
    }
    if (req.query.sortBy) {
        const sort = {}
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        queryParams.sort = sort
    }

    try {
        let task = 1
        if (flag) {
            task = await Task.find({ owner: req.user._id, completed: req.query.completed }, null, queryParams)
            return res.send(task);
        } else {
            task = await Task.find({ owner: req.user._id }, null, queryParams)
        }

        res.send(task)
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

//find task by id
route.get('/task/:id', auth, async (req, res) => {
    let id = req.params.id
    try {
        let task = await Task.findOne({ id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(404).send()
    }
})

//update task
route.patch('/task/:id', auth, async (req, res) => {
    const update = Object.keys(req.body)
    const allowedUpdates = ['desc', 'completed']

    const isValid = update.every((up) => {
        return allowedUpdates.includes(up)
    })
    if (!isValid) {
        return res.status(400).send({ error: "Invalid update" })
    }
    try {
        let task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(400).send()
        }

        update.forEach((up) => {
            task[up] = req.body[up]
        })
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//delete task
route.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})



module.exports = route