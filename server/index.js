import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import { v4 as generateID } from 'uuid';
import bcrypt from 'bcrypt';
import http from 'http';
import { Server } from "socket.io";

const app = express();
const PORT = process.env.SERVER_PORT || 5500;
const corsOptions = { 
  origin: `http://localhost:${process.env.FRONT_PORT}`,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
};
const DB_CONNECTION = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.${process.env.CLUSTER_ID}.mongodb.net/`;

app.use(express.json());
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Define the single connection event handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific conversation
  socket.on("join_conversation", (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    } else {
      console.error("join_conversation event called without a valid conversationId.");
    }
  });

  // Handle conversation messages
  socket.on("conversation_message", async ({ conversationId, senderId, senderUsername, text }) => {
    if (!conversationId || !senderId || !text ) {
      console.error("Incomplete message data received:", { conversationId, senderId, text });
      return;
    }

    const message = {
      _id: generateID(),
      senderId,
      senderUsername,
      text,
      timestamp: new Date().toISOString(),
      viewedBy: []
    };

    // Save message to the database
    const client = new MongoClient(DB_CONNECTION);
    try {
      await client.connect();
      const db = client.db('ChatApp');
      const conversationsCollection = db.collection('conversations');
      
      await conversationsCollection.updateOne(
        { _id: conversationId },
        { 
          $push: { messages: message },
          $set: { updatedAt: new Date().toISOString() }
        },
        { upsert: true }  // Create the conversation if it doesn't exist
      );

      // Emit the message to all users in the conversation
      io.to(conversationId).emit("conversation_message", message);
      console.log(`Message sent to conversation ${conversationId}:`, message);

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      client.close();
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// Get all users
app.get('/users', async (req, res) => {
  const client = new MongoClient(DB_CONNECTION);
  try {
    await client.connect();
    const data = await client.db('ChatApp').collection('users').find().toArray();
    res.send(data);
  } catch (err) {
    res.status(500).send({ error: err });
  } finally {
    client.close();
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
      res.status(409).send({ error: 'Username already exists' });
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

// user info editas
app.patch('/users/:id', async (req, res) => {
  const client = await MongoClient.connect(DB_CONNECTION);
  const { id } = req.params;
  const updateFields = { ...req.body };

  if (updateFields.password) {
    updateFields.password = bcrypt.hashSync(updateFields.password, 10);
  }

  try {
    const result = await client.db('ChatApp').collection('users').updateOne({ _id: id }, { $set: updateFields });

    if (result.matchedCount === 0) {
      res.status(404).send({ error: 'User not found' });
    } else {
      res.send(updateFields);
    }
  } catch (err) {
    res.status(500).send({ error: 'Failed to update profile' });
  } finally {
    client?.close();
  }
});

