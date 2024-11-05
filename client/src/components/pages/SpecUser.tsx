import { useContext, useEffect, useState } from "react";
import UsersContext, { UserInfoType, UsersContextTypes } from "../../contexts/UsersContext";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../UI/UserCard";

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

  // Function to start a conversation
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
    <>
      {
        user ? (
          <div>
            <button onClick={() => navigate(-1)}>Back</button>
            <UserCard key={user._id} data={user} />
            <button onClick={startConversation}>Chat</button>
          </div>
        ) : (
          <p>Loading...</p>
        )
      }
    </>
  );
}

export default SpecUser;
