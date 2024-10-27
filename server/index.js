import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import { v4 as generateID } from 'uuid';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.SERVER_PORT;
const corsOptions = { origin: `http://localhost:${process.env.FRONT_PORT}` };
const DB_CONNECTION = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.${process.env.CLUSTER_ID}.mongodb.net/`;

app.use(express.json());
app.use(cors(corsOptions));
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// visu vartotoju gavimas
app.get('/users', async (req, res) => {
  try {
    const client = await MongoClient.connect(DB_CONNECTION);
    const data = await client.db('ChatApp').collection('users').find().toArray();
    res.send(data);
  }
  catch (err) {
    res.status(500).send({ error: err })
  }
});

// get one user
app.get('/users/:id', async (req, res) => {
  try {
    let filter = { "_id": req.params.id };
    const client = await MongoClient.connect(DB_CONNECTION);
    const data = await client.db('ChatApp').collection('users').findOne(filter);
    res.send(data);
  }
  catch (err) {
    res.status(500).send({ error: err })
  }
});

// username paieskos funkcija, middleware
const findUsername = async (req, res, next) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const checkExisting = await client.db('ChatApp').collection('users').findOne({ username: req.body.username });
    if (checkExisting) {
      res.status(409).send({ errorMessage: 'Username already exists' });
    }
    else { next(); }
  }
  catch (err) {
    console.error(err);
    res.status(500).send({ error: err });
  }
  finally { client?.close(); }
};

// vartotojo kurimas
app.post('/users', findUsername, async (req, res) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const insertUser = {
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10),
      _id: generateID()
    };
    const data = await client.db('ChatApp').collection('users').insertOne(insertUser);
    res.send(insertUser);
  }
  catch (err) { res.status(500).send({ error: err }); }
  finally { client?.close(); }
});

// loginas, randa ir grazina vartotojo duomenis prisijungimui
app.post('/users/login', async (req, res) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const data = await client.db('ChatApp').collection('users').findOne({ username: req.body.username });
    if (data === null) {
      res.status(401).send({ error: 'Check login data' });
    }
    else {
      const passCheck = bcrypt.compareSync(req.body.password, data.password);
      if (passCheck === false) {
        res.status(401).send({ error: 'Check login data' });
      }
      else {
        res.send(data);
      }
    }
  }
  catch (err) { res.status(500).send({ error: err }); }
  finally { client?.close(); }
});