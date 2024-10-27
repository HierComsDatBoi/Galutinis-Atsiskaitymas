import { UserInfoType } from "../../contexts/UsersContext";
import styled from "styled-components";

const StyledDiv = styled.div`
border: 1px solid black;
display: flex;
width: 150px;
>img{
height: 50px;
}
`;

type Props = {
  data: UserInfoType
}

const UserCard = ({data}:Props) => {
  return (
    <StyledDiv>
    <img src={data.profileImg} alt="Profile Image" />
    <h3>{data.username}</h3>
    </StyledDiv>
  );
}

export default UserCard;