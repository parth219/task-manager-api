const express = require('express')
require('./db/mongoose') //this will run this file to connect to database
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express()

//middleware function 
// app.use((req, res, next) => {
//     res.status(503).send("Server under maintainenace")
//     // next() // always need to be called so next function like route path could be called else they wont ever run
// })

app.use(express.json()) // converts all incoming data from post from json to object
app.use(userRouter) //register the router
app.use(taskRouter)

const port = process.env.PORT

app.listen(port, () => {
    console.log("Server is running on port " + port)
})

