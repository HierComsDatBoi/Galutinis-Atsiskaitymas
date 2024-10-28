import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";
import styled from "styled-components";

const StyledHeader = styled.header`
display: flex;
justify-content: space-between;
align-items: center;
border-bottom: 1px solid black;
height: 60px;
padding: 0 30px;
>nav{
display: flex;
gap: 10px;
}
.active{
border-bottom: 3px solid blue;
}
`;
const Header = () => {

  const { userLogin, logOut } = useContext(UsersContext) as UsersContextTypes;
  const navigate = useNavigate();
  return (
    <StyledHeader>
      <nav>
        <NavLink to={'/allusers'}>Users</NavLink>
        <NavLink to={'/conversations'}>Conversations</NavLink>
      </nav>
      <div>
        {
          userLogin ?
            <div>
              <NavLink to={'/profile'}>{userLogin.username}</NavLink>
              <button onClick={ () => {
                logOut();
                navigate('');
              }
              }>Logout</button>
            </div> :
            <NavLink to={''}>Not Logged In</NavLink>
        }
      </div>
    </StyledHeader>
  );
}

export default Header;