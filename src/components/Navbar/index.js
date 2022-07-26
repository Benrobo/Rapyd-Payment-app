import React, { useEffect, useState, useContext } from "react";

import { Link } from "react-router-dom";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import DataContext from "../../context/DataContext";
import { Button } from "../UI-COMP";

function NavBar() {
  const { logout, isAuthenticated, user } = useContext(DataContext);

  return (
    <React.Fragment>
      <div
        className={`relative h-[60px] w-full flex items-center justify-between p-2 shadow-md`}
      >
        <div className="left w-[50%] "></div>
        <div className="right max-w-[300px] flex flex-row items-center justify-start gap-5 ">
          <p className="text-dark-100 font-extrabold capitalize ">
            {user?.username}
          </p>
          <Button
            type="danger"
            text="Logout"
            style={{ transform: `scale(.75)` }}
            onClick={logout}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

export default NavBar;
