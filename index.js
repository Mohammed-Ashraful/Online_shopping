const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://emajhon:cYOAAzk3uxGA1s2A@cluster0.wijwg.mongodb.net/Online_shopping?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('Online_shopping');
    const productCollection = database.collection('products');
    const orderCollection=database.collection('orders')
    
    app.get('/products', async (req, res) => {
      console.log(req.query);
      const cursor = productCollection.find({})
      const count = await cursor.count();
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let products;
      if (page) {
        products = await cursor.skip(page*size).limit(size).toArray()
      }
      else {
        products = await cursor.toArray()
      }

      res.send({
        count,
        products
      })
    })
    app.post('/products/bykeys', async(req, res)=>{
      const keys = req.body;
      const query = { key: { $in: keys } }
      const products = await productCollection.find(query).toArray();
      res.json(products)
    })


    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result)
    })

  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Ema jon server is running on heroku');  
});

app.listen(port, () => {
  console.log('Server running at port', port);
})