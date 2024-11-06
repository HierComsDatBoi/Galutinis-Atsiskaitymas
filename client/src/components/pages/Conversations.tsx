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


// fetch user info , no aggreg, f that

const Conversations = () => {

  const { allUsers } = useContext(UsersContext) as UsersContextTypes;
  // console.log(allUsers);

  return (
    <StyledSection>
        <h2>Conversations</h2>
    </StyledSection>
  );
}

export default Conversations;