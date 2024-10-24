import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import { v4 as generateID } from 'uuid';

const app = express();
const PORT = process.env.SERVER_PORT;
const corsOptions = {
  origin: `http://localhost:${process.env.FRONT_PORT}`
};
const DB_CONNECTION = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.${process.env.CLUSTER_ID}.mongodb.net/`;


app.use(express.json());
app.use(cors(corsOptions));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

app.get('/users', async (req, res) => {
  try {
    const client = await MongoClient.connect(DB_CONNECTION);
    const data = await client.db('ChatApp').collection('users').find().toArray();
    res.send(data);
  } catch(err) {
    res.status(500).send({ error: err })
  }
});