const express = require('express')
const cors = require('cors')

require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xzzyats.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const carsLandCollection = client.db("carsLand").collection("cars");

    // Get all toys
    app.get("/allToys", async (req, res) => {
      const cursor = carsLandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsLandCollection.findOne(query);
      res.send(result);
    });

    // Posting Cars Land
    app.post("/add-toys", async (req, res) => {
      const newCars = req.body;
      console.log(newCars);
      const result = await carsLandCollection.insertOne(newCars);
      res.send(result);
    });

    // Get Data By Emails
    app.get("/allToys/:email", async (req, res) => {
      console.log(req.params.sellerEmail);
      const result = await carsLandCollection
        .find({ sellerEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    // For Searching name, sellerName, subCategory
    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await carsLandCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { sellerName: { $regex: text, $options: "i" } },
            { subCategory: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // Update Single Toys
    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedChocolate = req.body;
      const chocolate = {
        $set: {
          name: updatedChocolate.name,
          photoUrl: updatedChocolate.photoUrl,
          price: updatedChocolate.price,
          quantity: updatedChocolate.quantity,
          rating: updatedChocolate.rating,
          sellerEmail: updatedChocolate.sellerEmail,
          sellerName: updatedChocolate.sellerName,
          subCategory: updatedChocolate.subCategory,
          details: updatedChocolate.details,
        },
      };
      const result = await carsLandCollection.updateOne(
        filter,
        chocolate,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Cars Land server side')
})

app.listen(port, () => {
    console.log(`Cars Land is running on: ${port}`);
})