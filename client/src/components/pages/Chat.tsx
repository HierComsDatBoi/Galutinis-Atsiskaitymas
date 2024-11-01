import { useState, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router-dom";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";

interface Message {
  text: string;
  senderId: string;
  timestamp: string;
}

const Chat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const { userLogin } = useContext(UsersContext) as UsersContextTypes;
  const { roomId } = useParams<{ roomId: string }>(); // Use roomId from URL params

  useEffect(() => {
    const newSocket = io("http://localhost:5500", {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Join the room when the socket connects
    if (roomId) {
      newSocket.emit("join_room", roomId);
    }

    // Listen for messages from the room
    newSocket.on("receive_message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup socket on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (socket && currentMessage && userLogin?._id) {
      const messageData = {
        senderId: userLogin._id,
        text: currentMessage,
        timestamp: new Date().toISOString(),
      };
      socket.emit("send_message", roomId, messageData); // Send message to the room
      setMessages((prev) => [...prev, messageData]); // Update local messages
      setCurrentMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;