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

const findOrCreateConversation = async (client, userIds) => {
  const db = client.db('ChatApp');
  const conversationsCollection = db.collection('conversations');

  const conversation = await conversationsCollection.findOne({
    participants: { $all: userIds, $size: userIds.length }
  });

  if (conversation) {
    return conversation._id;
  }

  // Create new conversation
  const newConversation = {
    _id: generateID(),
    participants: userIds,
  };

  await conversationsCollection.insertOne(newConversation);
  return newConversation._id;
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_conversation", (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    } else {
      console.error("join_conversation called without a valid conversationId.");
    }
  });

  // Handle incoming messages
  socket.on("conversation_message", async ({ conversationId, senderId, text }) => {
    if (!conversationId || !senderId || !text) {
      console.error("Incomplete message data received:", { conversationId, senderId, text });
      return;
    }

    const message = {
      _id: generateID(), // Generate a unique ID for the message
      conversationId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      viewed: false
    };

    io.to(conversationId).emit("conversation_message", message);
    console.log(`Message sent to conversation ${conversationId}:`, message);
  });

  socket.on("like_message", async ({ conversationId, messageId, liked }) => {
    if (!conversationId || !messageId) {
      console.error("Incomplete data for like_message:", { conversationId, messageId });
      return;
    }

    // Update like status in db
    const client = new MongoClient(DB_CONNECTION);
    try {
      await client.connect();
      const db = client.db('ChatApp');
      const result = await db.collection('messages').updateOne(
        { _id: messageId },
        { $set: { liked } }
      );

      if (result.matchedCount > 0) {
        const updatedMessage = await db.collection('messages').findOne({ _id: messageId });

        io.to(conversationId).emit("like_message", updatedMessage);
        console.log(`Message ${messageId} liked status updated to ${liked}`);
      }
    } catch (error) {
      console.error("Error handling like update:", error);
    } finally {
      client.close();
    }
  });

});

server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

//get conversations with logedin user id
app.get('/conversations/:logedinUserId', async (req, res) => {
  const loggedInUserId = req.params.logedinUserId;

  const client = new MongoClient(DB_CONNECTION);
  try {
    await client.connect();
    const db = client.db('ChatApp');
    const conversationsCollection = db.collection('conversations');
    const usersCollection = db.collection('users');

    const conversations = await conversationsCollection.aggregate([
      {
        $match: { participants: loggedInUserId }
      },
      {
        $lookup: {
          from: 'users',
          let: { participants: "$participants" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$participants"] } } },
            { $match: { _id: { $ne: loggedInUserId } } }
          ],
          as: 'userInfo'
        }
      },
      {
        $project: {
          _id: 1,
          participants: 1,
          userInfo: { $arrayElemAt: ["$userInfo", 0] }
        }
      }
    ]).toArray();

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).send({ error: "Failed to retrieve conversations" });
  } finally {
    await client.close();
  }
});

// Create conversation
app.post('/conversations/start', async (req, res) => {
  const { userIds } = req.body;

  const client = new MongoClient(DB_CONNECTION);
  try {
    await client.connect();
    const conversationId = await findOrCreateConversation(client, userIds);
    res.status(200).json({ conversationId });
  } catch (error) {
    console.error("Error finding/creating conversation:", error);
    res.status(500).send({ error: "Failed to start conversation" });
  } finally {
    client.close();
  }
});

// Endpoint to post new message
app.post('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  const { text, senderId } = req.body;
  const message = {
    _id: generateID(),
    conversationId,
    senderId,
    text,
    timestamp: new Date().toISOString(),
    viewed: false,
    liked: false
  };

  const client = new MongoClient(DB_CONNECTION);
  try {
    await client.connect();
    const db = client.db('ChatApp');
    await db.collection('messages').insertOne(message);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  } finally {
    client.close();
  }
});

// update message for like
app.post('/conversations/:conversationId/messages/:id', async (req, res) => {
  const { conversationId, id } = req.params;
  const { liked } = req.body;

  const client = new MongoClient(DB_CONNECTION);
  try {
    await client.connect();
    const db = client.db('ChatApp');
    await db.collection('messages').updateOne(
      { _id: id },
      { $set: { liked: liked } }
    );
    res.status(201).json(liked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  } finally {
    client.close();
  }
});

// Retrieve messages for conversation
app.get('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  const client = new MongoClient(DB_CONNECTION);

  try {
    await client.connect();
    const messagesCollection = client.db('ChatApp').collection('messages');
    const usersCollection = client.db('ChatApp').collection('users');

    const messages = await messagesCollection.aggregate([
      { $match: { conversationId } },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      { $unwind: '$senderInfo' },
      {
        $project: {
          _id: 1,
          text: 1,
          timestamp: 1,
          senderId: 1,
          liked: 1,
          'senderUsername': '$senderInfo.username',
          'senderProfileImg': '$senderInfo.profileImg'
        }
      },
      {
        $sort: { timestamp: 1 }
      }
    ]).toArray();

    res.status(200).json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  } finally {
    client.close();
  }
});

// conversation delete
app.delete('/conversations/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const client = new MongoClient(DB_CONNECTION);

  try {
    await client.connect();
    const db = client.db('ChatApp');

    const conversationResult = await db.collection('conversations').deleteOne({ _id: conversationId });

    const messagesResult = await db.collection('messages').deleteMany({ conversationId });

    if (conversationResult.deletedCount === 0) {
      res.status(404).send({ error: 'Conversation not found' });
    } else {
      res.status(200).send({ message: 'Conversation and messages deleted successfully' });
    }
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    res.status(500).send({ error: 'Failed to delete conversation' });
  } finally {
    client.close();
  }
});


// user routes

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

// username search func, middleware
const findUsername = async (req, res, next) => {
  if (!req.body.username) {
    return next();
  }

  const client = await MongoClient.connect(DB_CONNECTION);
  try {
    const checkExisting = await client.db('ChatApp').collection('users').findOne({ username: req.body.username });
    if (checkExisting) {
      res.status(409).send({ error: 'Username already exists' });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err });
  } finally {
    client?.close();
  }
};

// user create
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

// login
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

// user info edit
app.patch('/users/:id', findUsername, async (req, res) => {
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

