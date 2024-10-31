import { useContext, useEffect, useState } from "react";
import UsersContext, { UserInfoType, UsersContextTypes } from "../../contexts/UsersContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import UserCard from "../UI/UserCard";

const SpecUser = () => {

  const { allUsers, specificUser } = useContext(UsersContext) as UsersContextTypes;
  const [user, setUser] = useState<UserInfoType | undefined>()
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      setUser(specificUser(id));
    }
  }, [allUsers, id, specificUser]);

  return (
    <>
      {
        user ?
          <div>
            <button onClick={()=>navigate(-1)}>Back</button>
            <UserCard key={user._id} data={user} />
            {/* jeigu yra conversationu tada atvaizduot conversationus, jei ne tai mygtuka */}
            <button>Start Conversation</button>
          </div>
          :
          <p>Loading...</p>
      }
    </>
  );
}

export default SpecUser;