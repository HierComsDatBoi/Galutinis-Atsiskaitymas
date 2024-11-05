import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";

interface Message {
  _id: string;
  senderId: string;
  senderUsername: string;
  senderProfileImg: string;
  text: string;
  timestamp: string;
}

const socket: Socket = io("http://localhost:5500", {
  withCredentials: true,
});

const ChatRoomPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { userLogin } = useContext(UsersContext) as UsersContextTypes;
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5500/conversations/${conversationId}/messages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const data = await response.json();
        if (data) {
          setMessages(data);
        } else {
          console.error("Expected messages to be an array:", data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      socket.emit("join_conversation", conversationId);

      const handleIncomingMessage = (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]); // Append new message
      };

      socket.on("conversation_message", handleIncomingMessage);

      return () => {
        socket.off("conversation_message", handleIncomingMessage); // Clean up listener on unmount
        socket.emit("leave_conversation", conversationId); // Leave conversation on unmount
      };
    } else {
      console.error("conversation ID is missing!");
    }
  }, [conversationId]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !userLogin || !conversationId) return;

    const messageData: Omit<Message, "_id"> = {
      senderId: userLogin._id,
      senderUsername: userLogin.username,
      senderProfileImg: userLogin.profileImg,
      text: currentMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`http://localhost:5500/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageData.text, senderId: messageData.senderId }),
      });

      if (response.ok) {
        const savedMessage = await response.json(); // Get the saved message from the server

        // Emit the message through the socket so everyone sees it
        socket.emit("conversation_message", savedMessage); // This sends the message to everyone in the room

        // Optionally update the local messages state
        setMessages((prev) => [...prev, savedMessage]); // Append the new message to the state
        setCurrentMessage(""); // Clear input field
      } else {
        console.error("Failed to send message", response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!conversationId) {
    return <div>Conversation ID is missing. Please go back and select a valid conversation.</div>;
  }

  return (
    <div className="conversation-container">
      <h2>Conversation: {conversationId}</h2>
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

export default ChatRoomPage;
