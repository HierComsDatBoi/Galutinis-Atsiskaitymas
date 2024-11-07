import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import UsersContext, { UsersContextTypes } from "../../contexts/UsersContext";

type LoginType = {
  username:string;
  password:string
}
const Login = () => {

  const { logInUser } = useContext(UsersContext) as UsersContextTypes;
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const validationSchema = Yup.object({
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
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (values: LoginType) => {
    try {
      const loginResponse = await logInUser(values);
      if ("error" in loginResponse) {
        setLoginMessage(loginResponse.error);
      } else {
        setLoginMessage(loginResponse.success);
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <input type="submit" value="Login" disabled={isSubmitting} />
      </form>
      {loginMessage && <p>{loginMessage}</p>}
      <p>Don't have an account? <Link to="/register">Create account</Link>.</p>
    </section>
  );
}

export default Login;
