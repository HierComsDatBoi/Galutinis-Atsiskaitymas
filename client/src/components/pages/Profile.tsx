import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UsersContext, { UserInfoType, UsersContextTypes } from "../../contexts/UsersContext";

const Profile = () => {
  const [user, setUser] = useState<UserInfoType | undefined>();
  const { specificUser, allUsers } = useContext(UsersContext) as UsersContextTypes;
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setUser(specificUser(id));
    }
  }, [allUsers, id]);

  return (
    <section>
      <h2>User Info</h2>
      {
      user ? 
        <div>
          <h3>Username: {user.username}</h3>
          <p>Profile Image: {user.profileImg}</p>
        </div> : 
        <p>Loading...</p>
      }
    </section>
  );
};

export default Profile;
