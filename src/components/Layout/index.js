
import React, { useEffect, useState } from "react"
import { NavBar, Header, DomHead } from ".."
import SideBar from "../Navbar/SideBar"

function Layout({ sideBarActiveName, children }) {

  return (
    <div className={`w-screen h-screen overflow-hidden`}>
      <DomHead />
      <div className="relative  flex flex-row items-start justify-start w-screen h-screen">
        <SideBar active={sideBarActiveName} />
        <div className="w-full h-screen">
          {/* user navbar profile */}
          <NavBar />
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout

