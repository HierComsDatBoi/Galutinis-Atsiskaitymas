import { useReducer, useState, useEffect, createContext, ReactElement } from "react";

export type UserInfoType = {
  _id: string;
  username: string;
  password: string;
  profileImg: string;
};

type ChildProp = { children: ReactElement };

type ReducerTypes =
  { type: 'userData', allData: UserInfoType[] } |
  { type: 'addNew', data: UserInfoType }

type ErrorReturn = { error: string } | { success: string };

export type UsersContextTypes = {
  allUsers: UserInfoType[];
  createUser: (user: Omit<UserInfoType, "_id">) => Promise<ErrorReturn>,
  logInUser: (userLoginInfo: Pick<UserInfoType, "username" | "password">) => Promise<ErrorReturn>,
  logOut: () => void,
  userLogin: UserInfoType | null,
  specificUser: (id: UserInfoType["_id"]) => UserInfoType | undefined,
  passwordUpdate: (formData: Pick<UserInfoType, "password">) => Promise<ErrorReturn>,
  infoUpdate: (formData: Pick<UserInfoType, "username" | "profileImg">) => Promise<ErrorReturn>
}

const reducer = (state: UserInfoType[], action: ReducerTypes): UserInfoType[] => {
  switch (action.type) {
    case "userData":
      return action.allData;
    case "addNew":
      return [...state, action.data];
    default: return state;
  }
}

const UsersContext = createContext<UsersContextTypes | undefined>(undefined);

const UsersProvider = ({ children }: ChildProp) => {

  const [allUsers, dispatch] = useReducer(reducer, []);
  const [userLogin, setUserLogin] = useState<null | UserInfoType>(null);

  const createUser = async (user: Omit<UserInfoType, "_id">): Promise<ErrorReturn> => {
    try {
      const res = await fetch(`http://localhost:5500/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
      if (res.status === 409) {
        const errMsg = await res.json();
        return errMsg;
      }
      else {
        const data = await res.json();
        dispatch({
          type: 'addNew',
          data: data
        });
        setUserLogin(data);
        return { success: 'New user created successfully' };
      }
    }
    catch (err) {
      console.error(err);
      return { error: 'Error fetching data, try again later' };
    }
  }

  const logInUser = async (userLoginInfo: Pick<UserInfoType, 'username' | 'password'>): Promise<ErrorReturn> => {
    try {
      const res = await fetch(`http://localhost:5500/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userLoginInfo)
      });
      if (res.status === 401) { // error
        const err = await res.json();
        return err;
      }
      else { // success
        const data = await res.json();
        setUserLogin(data);
        localStorage.setItem('userLogin', JSON.stringify(data));
        return { success: 'Login successfull, redirecting...' }
      }
    }
    catch (err) {
      console.error(err);
      return { error: 'Login error, try again later' };
    }
  }

  const passwordUpdate = async (formData: Pick<UserInfoType, "password">) => {
    try {
      const res = await fetch(`http://localhost:5500/users/${userLogin?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.password
        })
      });

      const result = await res.json();

      if (!res.ok) {
        return { error: result.error || 'Password update failed' };
      } else {
        return { success: 'Password updated successfully' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'An error occurred while updating the password' };
    }
  }

  const infoUpdate = async (formData: Pick<UserInfoType, "username" | "profileImg">) => {
    try {
      const res = await fetch(`http://localhost:5500/users/${userLogin?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          profileImg: formData.profileImg,
        })
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        return { error: result.error || 'Profile update failed' };
      } else {
        return { success: 'Profile updated successfully' };
      }
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred while updating the profile' };
    }
  };
  

  const logOut = () => {
    setUserLogin(null);
    localStorage.removeItem('userLogin');
  }

  const specificUser = (id: UserInfoType['_id']): UserInfoType | undefined => {
    return allUsers.find(el => el._id === id);
  }

  useEffect(() => {
    fetch(`http://localhost:5500/users`)
      .then(res => res.json())
      .then(data => dispatch({
        type: "userData",
        allData: data
      }))
      .catch(err => console.error(err));
  }, []);

  return (
    <UsersContext.Provider
      value={{
        allUsers,
        logOut,
        logInUser,
        createUser,
        userLogin,
        specificUser,
        passwordUpdate,
        infoUpdate
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export { UsersProvider };
export default UsersContext;