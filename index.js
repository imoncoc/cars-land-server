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
      const cursor = carsLandCollection.find().limit(20)
      const result = await cursor.toArray();
      res.send(result);
    });



    // For Pagination
    app.get("/totalToys", async (req, res) => {
      const result = await carsLandCollection.estimatedDocumentCount();
      res.send({ totalProducts: result });
    });

    app.get("/totalAllToys", async (req, res) => {
      // console.log(req.query);
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;

      // const result = await productCollection.find().toArray()
      const result = await carsLandCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });








    // Get Toys by ID
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
    // app.get("/allToys/:email", async (req, res) => {
    //   console.log(req.params.sellerEmail);
    //   const result = await carsLandCollection
    //     .find({ sellerEmail: req.params.email })
    //     .toArray();
    //   res.send(result);
    // });

    // Get Data By Emails and Ascending or descending order 
    // app.get("/getEmail", async (req, res) => {
    //   let query = {};
    //   if(req.query?.email){
    //     query = {sellerEmail: req.query.email}
    //   }
      
    //   const sortType = req.query.type === 'ascending';
    //   const result = await carsLandCollection.find(query).sort({price: sortType? 1 : -1}).toArray()
    //   res.send(result);
    // });
    app.get("/getEmail", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      const sortType = req.query.type === "ascending";
      const result = await carsLandCollection.find(query).toArray();

      // Convert the price field to a numeric type
      result.forEach((car) => {
        car.price = parseFloat(car.price);
      });

      // Sort the results by price
      result.sort((a, b) => {
        if (sortType) {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });

      res.send(result);
    });

    // Get Data By Sub-category
    app.get("/category/:subCategory", async (req, res) => {
      console.log(req.params.subCategory);
      const result = await carsLandCollection
        .find({ subCategory: req.params.subCategory })
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


    // Get 10 Random Photos 
    app.get("/randomPhotoUrls", async (req, res) => {
      const result = await carsLandCollection
        .aggregate([
          { $sample: { size: 12 } },
          { $project: { _id: 0, photoUrl: 1 } },
        ])
        .toArray();

      const photoUrls = result.map((item) => item.photoUrl);
      res.send(photoUrls);
    });

    // Get 5 Random Data
    app.get("/randomData", async (req, res) => {
      const result = await carsLandCollection
        .aggregate([{ $sample: { size: 5 } }])
        .toArray();

      res.send(result);
    });

    // Toys Delete by ID
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsLandCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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