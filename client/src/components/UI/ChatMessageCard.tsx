import { Message } from "../pages/ChatRoomPage";
import { UserInfoType } from "../../contexts/UsersContext";

type MessageCardProps = {
  msg: Message;
  userLogin: UserInfoType | undefined;
  otherUserInfo: (UserInfoType | undefined)[];
}

const MessageCard = ({ msg, userLogin, otherUserInfo } : MessageCardProps) => {
  const senderUsername = msg.senderId === userLogin?._id
  ? userLogin?.username
  : otherUserInfo?.find(user => user?._id === msg.senderId)?.username;

  const senderProfileImg = msg.senderId === userLogin?._id
  ? userLogin?.profileImg
  : otherUserInfo?.find(user => user?._id === msg.senderId)?.profileImg;

  return (
    <div key={msg._id} className={`message ${msg.senderId === userLogin?._id ? "my-message" : "other-message"}`}>
      <div className="message-header">
        <img src={senderProfileImg} alt="Sender Profile Img" />
        <div>
        <strong>{senderUsername}:</strong>
        <span>{msg.text}</span>
        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
