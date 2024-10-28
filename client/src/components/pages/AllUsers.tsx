import { useContext } from "react";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";
import UserCard from "../UI/UserCard";
import styled from "styled-components";

const StyledSection = styled.section`
display: flex;
>aside{
width: 200px;
}
`;

const AllUsers = () => {

  const { allUsers } = useContext(UsersContext) as UsersContextTypes;
  // console.log(allUsers);

  return (
    <StyledSection>
        <h2>user list</h2>
        {
          allUsers.length ?
            allUsers.map(user =>
              <UserCard key={user._id} data={user} />
            ) :
            <p>Loading...</p>
        }
    </StyledSection>
  );
}

export default AllUsers;