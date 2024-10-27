import { Route, Routes } from "react-router-dom"
import Login from "./components/pages/Login"
import Register from "./components/pages/Register"
import Conversations from "./components/pages/Conversations"
import Profile from "./components/pages/Profile"

const App = () => {

  return (
    <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='register' element={<Register />}/>
      <Route path='conversations' element={<Conversations />}/>
      <Route path='profile/:id' element={<Profile />}/>
    </Routes>
  )

}


export default App
