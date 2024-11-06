import { useContext, useEffect, useState } from "react";
import UsersContext, { UsersContextTypes, UserInfoType } from "../../contexts/UsersContext";
import styled from "styled-components";
import UserCard from "../UI/UserCard";
import { useNavigate } from "react-router-dom";

const StyledSection = styled.section`
display: flex;
  flex-direction: column;
  gap: 10px;

  .userListCard {
    display: flex;
    border: 1px solid #dbdbdb;
    border-radius: 10px;
    cursor: pointer;
    background: #ffffff20;

    >div {
      height: 100px;

      >img {
        height: 100%;
      }
    }
  }
`;

interface Conversation {
  _id: string;
  participants: string[];
  userInfo?: UserInfoType;
}

const Conversations = () => {
  const { userLogin } = useContext(UsersContext) as UsersContextTypes;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`http://localhost:5500/conversations/${userLogin?._id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }
        const conversationsData = await response.json();
        if (conversationsData) {
          setConversations(conversationsData);
        } else {
          console.error("Expected messages to be an array:", conversationsData);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    if (userLogin) {
      fetchConversations()
    }

  }, [userLogin]);

  const converseCount = conversations.length;

  return (
    <StyledSection>
      <h2>Conversations ( {converseCount} )</h2>
      {
        conversations.length ?
          conversations.map((convo) => {
            const otherUser = convo.userInfo && convo.userInfo._id !== userLogin?._id ? convo.userInfo : null;

            return (
              <div key={convo._id}>
                {
                  otherUser ?
                    <div className="userListCard"
                      key={otherUser._id}
                      onClick={() => navigate(`/chat/${convo._id}`)}>
                      <UserCard key={otherUser._id} data={otherUser} />
                    </div> : <div>No participants found</div>
                }
              </div>
            );
          }) : <div>No conversations...</div>
      }
    </StyledSection>

  )

}

export default Conversations;