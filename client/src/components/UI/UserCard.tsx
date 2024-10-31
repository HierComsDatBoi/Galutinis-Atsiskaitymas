import { UserInfoType } from "../../contexts/UsersContext";

type Props = {
  data: UserInfoType
}


const UserCard = ({data}:Props) => {

  return (
    <>
    <div>
    <img src={data.profileImg} alt="Profile Image" />
    </div>
    <h3>{data.username}</h3>
    </>
  );
}

export default UserCard;