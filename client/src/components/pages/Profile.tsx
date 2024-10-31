import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";
import styled from "styled-components";

const StyledSection = styled.section`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  >div{
    width: 80%;
  }

  p {
    grid-column: 1 / span 2;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;

    >div {
      flex-direction: column;
      display: flex;
    }
  }
`;

const Profile = () => {
  const { userLogin, passwordUpdate, infoUpdate } = useContext(UsersContext) as UsersContextTypes;
  const [message, setMessage] = useState<string>('');

  const profileValidationSchema = Yup.object({
    profileImg: Yup.string()
      .url('Must be a valid URL')
      .nullable()
      .notRequired(),
      username: Yup.string()
      .min(5, 'Username must be between 5 and 15 characters')
      .max(15, 'Username must be between 5 and 15 characters')
      .nullable()
      .notRequired()
  });

  const passwordValidationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(20, 'Password must be at most 20 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&]{6,20}$/, 'Password must contain an uppercase letter, a lowercase letter, a number, and a symbol')
      .nullable()
      .notRequired(),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .nullable()
      .notRequired()
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting }
  } = useForm({
    defaultValues: {
      profileImg: userLogin?.profileImg || undefined,
      username: userLogin?.username || undefined
    },
    resolver: yupResolver(profileValidationSchema)
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
  } = useForm({
    resolver: yupResolver(passwordValidationSchema)
  });

  const handleInfoUpdate = async (formData: { profileImg?: string | null; username?: string | null }) => {
    setMessage('');

    const infoUpdateResponse = await infoUpdate(formData);

    if ('error' in infoUpdateResponse) {
      setMessage(infoUpdateResponse.error);
    } else {
      setMessage(infoUpdateResponse.success);
    }
  };

  const handlePasswordUpdate = async (formData: {password?: string | null}) => {
    setMessage('');
    const passwordUpdateResponse = await passwordUpdate(formData);
    if ('error' in passwordUpdateResponse) {
      setMessage(passwordUpdateResponse.error);
    } else {
      setMessage(passwordUpdateResponse.success);
    }
  };

  return (
    <StyledSection>
      <div>
      <h2>Edit Profile</h2>
      <form onSubmit={handleProfileSubmit(handleInfoUpdate)}>
        <div>
          <label htmlFor="profileImg">User Picture:</label>
          <input type="url" {...profileRegister('profileImg')} id="profileImg" />
          {profileErrors.profileImg && <p>{profileErrors.profileImg.message}</p>}
        </div>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" {...profileRegister('username')} id="username" />
          {profileErrors.username && <p>{profileErrors.username.message}</p>}
        </div>
        <button type="submit" disabled={isProfileSubmitting}>Save Changes</button>
      </form>
    </div>
    <div>
    <h2>Edit Password</h2>
      <form onSubmit={handlePasswordSubmit(handlePasswordUpdate)}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input type="password" {...passwordRegister('password')} id="password" />
          {passwordErrors.password && <p>{passwordErrors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmNewPassword">Confirm New Password:</label>
          <input type="password" {...passwordRegister('confirmNewPassword')} id="confirmNewPassword" />
          {passwordErrors.confirmNewPassword && <p>{passwordErrors.confirmNewPassword.message}</p>}
        </div>
        <button type="submit" disabled={isPasswordSubmitting}>Save Changes</button>
      </form>
    </div>
      {message && <p>{message}</p>}
    </StyledSection>
  );
};

export default Profile;