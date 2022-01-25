// CRUD create read update delete

// const mongo = require('mongodb')
// const MongoClient = mongo.MongoClient // gives access to operations for CRUD
// const ObjectId = mongo.ObjectId

const { MongoClient, ObjectId } = require('mongodb') // using destructuring...same as above lines

// const id = new ObjectId(); //generates object ID
// console.log(id)
// console.log(id.getTimestamp())

const connectionUrl = 'mongodb://127.0.0.1:27017' // need to provide server on which the database is running
const databaseName = 'task-manager' // a name for database can be any name

MongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, client) => { //makes connection to database
    //this is used to parse the connection url and callback function is called 
    // after connection is made with database. Asynchronous method.
    if (error) {
        return console.log(error)
    }
    const db = client.db(databaseName) //connects to databaseName...if database doesnt exist will make one
})