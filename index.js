const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



app.get('/', (req, res) => {
    res.send('Job portal server side')
})

app.listen(port, () => {
    console.log(`Job Portal is running on: ${port}`);
})