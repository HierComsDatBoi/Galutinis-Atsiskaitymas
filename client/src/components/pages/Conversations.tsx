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

const Conversations = () => {

  const { allUsers } = useContext(UsersContext) as UsersContextTypes;
  // console.log(allUsers);

  return (
    <StyledSection>

      <aside>
        <h2>user list</h2>
        {
          allUsers.length ?
            allUsers.map(user =>
              <UserCard key={user._id} data={user} />
            ) :
            <p>Loading...</p>
        }
      </aside>

      <div>
        <h2>messages</h2>

      </div>
    </StyledSection>
  );
}

export default Conversations;