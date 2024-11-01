import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";

// Define the structure of a Message
interface Message {
  _id: string;
  senderId: string;
  senderUsername: string;
  text: string;
  timestamp: string;
}

// Define the parameters for the room
interface RoomParams {
  [key: string]: string | undefined;
}

// Establish socket connection with appropriate URL and options
const socket: Socket = io("http://localhost:5500", {
  withCredentials: true,
});

const Room: React.FC = () => {
  const { roomId } = useParams<RoomParams>();  // Get roomId from URL parameters
  const { userLogin } = useContext(UsersContext) as UsersContextTypes; // Access logged-in user's info from context
  const [messages, setMessages] = useState<Message[]>([]);  // State to hold messages
  const [currentMessage, setCurrentMessage] = useState<string>("");

  useEffect(() => {
    if (roomId) {
      socket.emit("join_room", roomId);
      console.log(`Joined room: ${roomId}`);

      // Listen for incoming messages
      socket.on("room_message", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("room_message"); // Cleanup listener on unmount
        socket.emit("leave_room", roomId); // Leave room on unmount
      };
    } else {
      console.error("Room ID is missing!");
    }
  }, [roomId]);

  const sendMessage = () => {
    if (currentMessage.trim() && userLogin && roomId) {
      const messageData: Message = {
        _id: "", // Placeholder, will be generated on the server
        senderId: userLogin._id,
        senderUsername: userLogin.username,
        text: currentMessage,
        timestamp: new Date().toISOString(),
      };
      console.log(messageData);

      // Emit the message to the server
      socket.emit("room_message", { roomId, senderId: userLogin._id, senderUsername: userLogin.username, text: currentMessage });

      // Clear the input field
      setCurrentMessage(""); // Clear input
    }
  };

  if (!roomId) {
    return <div>Room ID is missing. Please go back and select a valid room.</div>;
  }

  return (
    <div className="room-container">
      <h2>Room: {roomId}</h2>
      <div className="message-container">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${msg.senderId === userLogin?._id ? "my-message" : "other-message"}`}
          >
            <p><strong>{msg.senderUsername}</strong>: {msg.text}</p>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Room;
