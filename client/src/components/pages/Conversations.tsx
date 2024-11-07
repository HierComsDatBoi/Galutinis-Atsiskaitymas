import { useContext } from "react";
import ConversationsContext, { ConversationsContextTypes } from "../../contexts/ConversationsContext";
import UsersContext from "../../contexts/UsersContext";
import styled from "styled-components";
import UserCard from "../UI/UserCard";
import { useNavigate } from "react-router-dom";

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;

  button:hover{
  background-color: #b60000;
  }

  .userListCard {
    display: flex;
    align-items: center;
    border: 1px solid #dbdbdb;
    border-radius: 10px;
    cursor: pointer;
    background: #ffffff20;
    gap: 10px;
    

    > div {
      height: 100px;

      > img {
        height: 100%;
      }
    }
  }
`;

const Conversations = () => {
  const { conversations, deleteConversation } = useContext(ConversationsContext) as ConversationsContextTypes;
  const { userLogin } = useContext(UsersContext) || { userLogin: null };
  const navigate = useNavigate();

  const handleDelete = (convoId: string) => {
    if (window.confirm("Are you sure?"))
      deleteConversation(convoId);
  };

  const converseCount = conversations.length;

  return (
    <StyledSection>
      <h2>Conversations {converseCount}</h2>
      {conversations.length ? conversations.map(convo => {
        const otherUser = convo.userInfo && convo.userInfo._id !== userLogin?._id ? convo.userInfo : null;

        return (
          <div key={convo._id}>
            {otherUser
              ? <div className="userListCard" onClick={() => navigate(`/chat/${convo._id}`)}>
                <UserCard data={otherUser} />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(convo._id);
                  }}>Delete
                </button>
              </div> : <div>No participants found</div>
            }
          </div>
        )
      }) : <div>No conversations...</div>}
    </StyledSection>
  );
};

export default Conversations;
