import Header from "../UI/Header";

import { Outlet } from "react-router-dom";

const MainOutlet = () => {
  return ( 
    <>
    <Header />
    <Outlet/>
    </>
   );
}
 
export default MainOutlet;