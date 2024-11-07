import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import UsersContext, {UsersContextTypes, UserInfoType} from "../../contexts/UsersContext";

const Register = () => {
  const { createUser } = useContext(UsersContext) as UsersContextTypes;
  const [registerMessage, setRegisterMessage] = useState('');
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    profileImg: Yup.string()
      .url('Must be valid URL')
      .required('Required'),
    username: Yup.string()
      .min(5, 'Must be at between 5 and 15')
      .max(15, 'Must be at between 5 and 15')
      .required('Required'),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&]{6,20}$/,
        'Password must contain at least one capital, one lowercase and have at least one symbol(@$!%*?&.), length must be between 6 and 20'
      )
      .required('Required'),
    passwordRepeat: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Required')
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (values: Omit<UserInfoType, "_id">) => {
    const registerResponse = await createUser({
      profileImg: values.profileImg,
      username: values.username,
      password: values.password
    });

    if ("error" in registerResponse) {
      setRegisterMessage(registerResponse.error);
    } else {
      setRegisterMessage(registerResponse.success);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  return (
    <section>
      <h2>Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="profileImg">User picture:</label>
          <input
            type="url"
            {...register('profileImg')}
            id="profileImg"
          />
          {errors.profileImg && <p>{errors.profileImg.message}</p>}
        </div>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            {...register('username')}
            id="username"
          />
          {errors.username && <p>{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            {...register('password')}
            id="password"
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="passwordRepeat">Password repeat:</label>
          <input
            type="password"
            {...register('passwordRepeat')}
            id="passwordRepeat"
          />
          {errors.passwordRepeat && <p>{errors.passwordRepeat.message}</p>}
        </div>
        <input type="submit" value="Register" disabled={isSubmitting} />
      </form>
      {registerMessage && <p>{registerMessage}</p>}
      <p>If you are already registered <Link to="/">Login</Link>.</p>
    </section>
  );
};

export default Register;
