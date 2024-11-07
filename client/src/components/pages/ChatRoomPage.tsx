import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import MessageCard from "../UI/ChatMessageCard";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";
import ConversationsContext, { ConversationsContextTypes } from "../../contexts/ConversationsContext";
import styled from "styled-components";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 1rem;

  h2 {
    margin-bottom: 1rem;
  }
    .time-like-div{
    display: flex;
    gap: 7px;
    
    }
  .message-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: auto;
    flex-grow: 1;
    padding: 1px;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: none;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #888;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: #ccc; /* Thumb color on hover */
    }

    > div {
      border: 1px solid black;
      width: 70%;
      border-radius: 10px;
      
      > div {
        display: flex;
        border-radius: 50%;
        height: 75px;
        align-items: center;

        > img {
          height: 100%;
        }
        > div {
          display: flex;
          flex-direction: column;
        }
      }
    }
  }

  .input-container {
    display: flex;
    gap: 10px;
    padding: 1rem 0;
  }

  .my-message {
  align-self: flex-end;
    background-color: #1b232e;
  }

  .other-message {
    background-color: #2c3a4a;
    align-self:flex-start;
  }
  
  .hiddenDiv{
    visibility: hidden;
    height: 0;
    padding: 0;
  }
`;


export type Message = {
  _id: string;
  senderId: string;
  text: string;
  timestamp: string;
  liked: boolean;
}

const socket: Socket = io("http://localhost:5500", { withCredentials: true });

const ChatRoomPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { userLogin } = useContext(UsersContext) as UsersContextTypes;
  const { conversations } = useContext(ConversationsContext) as ConversationsContextTypes;
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const otherUserInfo = conversations.filter(conv => conv._id === conversationId).map(user => user.userInfo).flat();

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5500/conversations/${conversationId}/messages`);
        if (!response.ok) throw new Error(`Failed to fetch messages: ${response.statusText}`);

        const data = await response.json();
        setMessages(data);
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
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      socket.on("conversation_message", handleIncomingMessage);

      socket.on("like_message", (updatedMessage) => {
        setMessages(prevMessages => prevMessages.map(msg =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ));
      });
      

      return () => {
        socket.off("conversation_message", handleIncomingMessage);
        socket.emit("leave_conversation", conversationId);
      };
    } else {
      console.error("Conversation ID is missing!");
    }
  }, [conversationId]);

  const handleLikeToggle = (messageId: string, currentLikeState: boolean) => {
    const updatedMessages = messages.map(msg =>
      msg._id === messageId ? { ...msg, liked: !currentLikeState } : msg
    );
    setMessages(updatedMessages);

    socket.emit("like_message", {conversationId, messageId, liked: !currentLikeState });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !userLogin || !conversationId) return;

    const messageData = {
      senderId: userLogin._id,
      text: currentMessage,
      timestamp: new Date().toISOString(),
      liked: false,
    };

    try {
      const response = await fetch(`http://localhost:5500/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageData.text, senderId: messageData.senderId }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket.emit("conversation_message", savedMessage);
        setCurrentMessage("");
      } else {
        console.error("Failed to send message:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <StyledContainer className="conversation-container">
      <h2>Conversation: {conversationId}</h2>
      <div className="message-container">
        {messages.map((msg) => (
          <MessageCard
          key={msg._id}
          msg={msg}
          userLogin={userLogin}
          otherUserInfo={otherUserInfo}
          onLikeToggle={handleLikeToggle}
        />
        ))}
        <div className="hiddenDiv" ref={messageEndRef} />
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
    </StyledContainer>
  );
};

export default ChatRoomPage;
