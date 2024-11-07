import { useContext, useEffect, useState } from "react";
import UsersContext, { UserInfoType, UsersContextTypes } from "../../contexts/UsersContext";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../UI/UserCard";
import styled from "styled-components";

const Styledsection = styled.section`
  >div{
    display: flex;
    flex-direction: column;
    width: 50%;
    align-items: center;
    border: 1px solid #dbdbdb;
    border-radius: 10px;
    background: #ffffff20;
    gap: 10px;

    >div:last-child{
      display:flex;
      gap:10px;
      margin-bottom: 10px;
        > button{
        width: 100px;
      }
    }

    > div:first-child {
      height: 200px;

      > img {
        height: 100%;
      }
    }
  }
  `;

const SpecUser = () => {
  const { allUsers, specificUser, userLogin } = useContext(UsersContext) as UsersContextTypes;
  const [user, setUser] = useState<UserInfoType | undefined>();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setUser(specificUser(id));
    }
  }, [allUsers, id, specificUser]);

  const startConversation = async () => {
    if (!userLogin || !id) return;
    console.log("userlogin: ", userLogin._id);
    console.log("id: ", id);

    try {
      const response = await fetch(`http://localhost:5500/conversations/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: [userLogin._id, id] }),
      });

      if (response.ok) {
        const { conversationId } = await response.json();
        navigate(`/chat/${conversationId}`);
      } else {
        console.error("Failed to start a conversation", response);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <Styledsection>
        <h2>User</h2>
      {
        user ?
          <div>
            <UserCard key={user._id} data={user} />
            <div>
            <button onClick={() => navigate(-1)}>Back</button>
            <button onClick={startConversation}>Chat</button>
            </div>
          </div>
        : <p>Loading...</p>
      }
    </Styledsection>
  );
}

export default SpecUser;
