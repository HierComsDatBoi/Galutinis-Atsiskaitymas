import { Route, Routes } from "react-router-dom"
import Login from "./components/pages/Login"
import Register from "./components/pages/Register"
import Conversations from "./components/pages/Conversations"
import Profile from "./components/pages/Profile"
import MainOutlet from "./components/Outlet/Outlet"
import AllUsers from "./components/pages/AllUsers"

const App = () => {

  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path="" element={<MainOutlet/>}>
        <Route path='allusers' element={<AllUsers />} />
        <Route path='conversations' element={<Conversations />} />
        <Route path='profile' element={<Profile />} />
      </Route>
    </Routes>
  )

}


export default App
