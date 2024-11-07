import { useContext } from "react";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";
import UserCard from "../UI/UserCard";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;

  >div {
    display: flex;
    border: 1px solid #dbdbdb;
    border-radius: 10px;
    cursor: pointer;
    background: #ffffff20;
    align-items: center;

    >div {
      height: 100px;

      >img {
        height: 100%;
      }
    }
  }
`;

const AllUsers = () => {

  const { allUsers } = useContext(UsersContext) as UsersContextTypes;
  // console.log(allUsers);
  const navigate = useNavigate();
  return (
    <StyledSection>
      <h2>List of all users</h2>
      {
        allUsers.length ?
          allUsers.map(user =>
            <div className="userListCard" key={user._id} onClick={() => navigate(`/users/${user._id}`)}>
              <UserCard key={user._id} data={user} />
            </div>
          ) :
          <p>Loading...</p>
      }
    </StyledSection>
  );
}

export default AllUsers;