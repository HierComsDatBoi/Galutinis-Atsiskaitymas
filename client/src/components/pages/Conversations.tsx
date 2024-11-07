// Conversations.tsx
import { useContext } from "react";
import ConversationsContext from "../../contexts/ConversationsContext";
import UsersContext from "../../contexts/UsersContext";
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

    > div {
      height: 100px;

      > img {
        height: 100%;
      }
    }
  }
`;

const Conversations = () => {
  const { conversations } = useContext(ConversationsContext) || { conversations: [] };
  const { userLogin } = useContext(UsersContext) || { userLogin: null };
  const navigate = useNavigate();

  const converseCount = conversations.length;

  return (
    <StyledSection>
      <h2>Conversations ({converseCount})</h2>
      {conversations.length ? (
        conversations.map((convo) => {
          // Identify the other user in the conversation
          const otherUser = convo.userInfo && convo.userInfo._id !== userLogin?._id ? convo.userInfo : null;

          return (
            <div key={convo._id}>
              {otherUser ? (
                <div
                  className="userListCard"
                  key={otherUser._id}
                  onClick={() => navigate(`/chat/${convo._id}`)}
                >
                  <UserCard key={otherUser._id} data={otherUser} />
                </div>
              ) : (
                <div>No participants found</div>
              )}
            </div>
          );
        })
      ) : (
        <div>No conversations...</div>
      )}
    </StyledSection>
  );
};

export default Conversations;
