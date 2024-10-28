import { useContext } from "react";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";

const Profile = () => {
  const { userLogin } = useContext(UsersContext) as UsersContextTypes;

  return (
    <section>
      <h2>User Info</h2>
      {
      userLogin ? 
        <div>
          <h3>Username: {userLogin.username}</h3>
          <img src={userLogin.profileImg} alt="Profile Image" />
        </div> : 
        <p>Loading...</p>
      }
    </section>
  );
};

export default Profile;
