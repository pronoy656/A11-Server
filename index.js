const express = require('express');
const cors = require('cors');
const jwt = require ('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d5v1sm5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares
const logger = (req,res,next) =>{
  console.log('log info',req.method, req.url);
  next();
}

const verifyTokens = (req,res,next) =>{
  const token = req?.cookies?.token
  // console.log('token in the middleware', token)
  if(!token){
    return res.status(401).send({message: 'Unauthorized access'})

  }
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN,(err,decoded) =>{
    if(err){
     return res.status(401).send({message: 'unauthorized Access'})
    }
    req.user = decoded;
    next();
  })

}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create collection
    const jobCollection = client.db('allJobsCollection').collection('addJob')

  // auth related api
  app.post('/jwt', async(req,res) =>{
    const user = req.body
    console.log('user for token', user);
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: '1h'})

    res.cookie('token', token,{
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    .send({success: true})
  })


  // log out api
  app.post('/logout', async(req,res) =>{
    const user = req.body
    console.log('log out user', user )
    res.clearCookie('token', {maxAge: 0}).send({success:true})
  })

// get add job 
app.get('/allJobs', async(req,res) =>{
    const courser = jobCollection.find();
    const result = await courser.toArray();
    res.send(result)
})


// add job post
app.post('/allJobs', logger, async(req,res) =>{
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
app.get('/myJobs', logger, verifyTokens, async (req,res) =>{
    console.log(req.query.email)
    console.log('token owner',req.user)
    if(req.user.email !== req.query.email){
      return res.status(403).send({message: 'forbidden access'})
    }
    let query = {}
    if(req.query?.email){
       query = {email: req.query.email}
    }
    const result = await jobCollection.find(query).toArray()
    res.send(result)
})


// get  Method for updated
app.get('/allJobs/:id', async (req,res) =>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await jobCollection.findOne(query)
  res.send(result)
})

// update method
app.put('/allJobs/:id', async(req,res) =>{
  const id = req.params.id
  console.log('id',id)
  const filter = {_id: new ObjectId(id)}
  const options = {upsert: true}
  const updatedJobs = req.body
  const Jobs = {
    $set: {
      picture: updatedJobs.picture,
      subCategory: updatedJobs.subCategory,
      name: updatedJobs.name,
      email: updatedJobs.email,
      category: updatedJobs.category,
      salaryRange: updatedJobs.salaryRange,
      JobPostingDate: updatedJobs.JobPostingDate,
      applicationDeadline: updatedJobs.applicationDeadline,
      jobApplicantsNumber: updatedJobs.jobApplicantsNumber,
      jobDescription: updatedJobs.jobDescription,
    }
  }
  const result = await jobCollection.updateOne(filter,Jobs,options)
  res.send(result)
})


// delete Method
app.delete('/allJobs/:id', async (req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await jobCollection.deleteOne(query)
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