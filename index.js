const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d5v1sm5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create collection
    const jobCollection = client.db('allJobsCollection').collection('addJob')

// get add job 
app.get('/allJobs', async(req,res) =>{
    const courser = jobCollection.find();
    const result = await courser.toArray();
    res.send(result)
})


// add job post
app.post('/allJobs', async(req,res) =>{
    const newJob = req.body
    console.log(newJob)
    const result = await jobCollection.insertOne(newJob)
    res.send(result)
})

// Details Page
app.get('/allJobs/:id', async (req,res) =>{
    const id = req.params.id;
    console.log({id})
    const query = {_id: new ObjectId(id)}
    const result = await jobCollection.findOne(query)
    res.send(result)
})

// email based data find
app.get('/myJobs', async (req,res) =>{
    console.log(req.query.email)
    let query = {}
    if(req.query?.email){
       query = {email: req.query.email}
    }
    const result = await jobCollection.find(query).toArray()
    res.send(result)
})




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res) =>{
    res.send('assignment 11 server is running')
})


app.listen(port, () =>{
    console.log(`Assignment -11 server is running on port ${port}`)
})