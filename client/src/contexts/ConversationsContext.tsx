// ConversationsContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UsersContextTypes, UserInfoType } from "./UsersContext";
import UsersContext from "./UsersContext";

interface Conversation {
  _id: string;
  participants: string[];
  userInfo?: UserInfoType;
}

export type ConversationsContextTypes = {
  conversations: Conversation[];
  fetchConversations: () => void;
  deleteConversation: (conversationId: string) => void;
};

const ConversationsContext = createContext<ConversationsContextTypes | null>(null);

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const { userLogin } = useContext(UsersContext) as UsersContextTypes;
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!userLogin) return;

    try {
      const response = await fetch(`http://localhost:5500/conversations/${userLogin._id}`);
      if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.statusText}`);

      const data = await response.json();
      setConversations(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [userLogin]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:5500/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      // Remove the deleted conversation from state
      setConversations((prevConversations) =>
        prevConversations.filter((conv) => conv._id !== conversationId)
      );
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <ConversationsContext.Provider 
    value={{ 
      conversations, 
      fetchConversations, 
      deleteConversation }}>
      {children}
    </ConversationsContext.Provider>
  );
};

export default ConversationsContext;
