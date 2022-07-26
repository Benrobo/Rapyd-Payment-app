import React, { useEffect, useState } from "react"

import { Link } from "react-router-dom"
import { FaGithub, FaTwitter } from "react-icons/fa"
import { FiMail } from "react-icons/fi"

function SideBar({ active }) {


    return (
        <React.Fragment>
            <div className={`relative h-screen w-[250px] bg-dark-100 p-3`}>

                <h1 className="text-white-100 py-4 px-4 font-sans font-extrabold text-[20px] ">RayPal</h1>
                <ul className="w-full mt-5 flex flex-col items-center justify-start bg-dark-100">
                    <Link to="/dashboard" className="w-full">
                        <li className={`w-full px-4 py-3 font-extrabold rounded-md cursor-pointer text-[13px] ${active === "dashboard" ? "bg-dark-200 text-white-100" : "bg-dark-100 text-white-200"}`}>
                            Overview
                        </li>
                    </Link>
                    <Link to="/wallets" className="w-full">
                        <li className={`w-full mt-4 px-4 py-3 font-extrabold rounded-md cursor-pointer text-[13px] ${active === "wallets" ? "bg-dark-200 text-white-100" : "bg-dark-100 text-white-200"}`}>
                            Wallets
                        </li>
                    </Link>
                    <Link to="/store" className="w-full">
                        <li className={`w-full mt-4 px-4 py-3 font-extrabold rounded-md cursor-pointer text-[13px] ${active === "store" ? "bg-dark-200 text-white-100" : "bg-dark-100 text-white-200"}`}>
                            Store
                        </li>
                    </Link>
                    <Link to="/payment/links" className="w-full">
                        <li className={`w-full mt-4 px-4 py-3 font-extrabold rounded-md cursor-pointer text-[13px] ${active === "paymentLinks" ? "bg-dark-200 text-white-100" : "bg-dark-100 text-white-200"}`}>
                            Payment Links
                        </li>
                    </Link>
                    <Link to="/payment/buttons" className="w-full">
                        <li className={`w-full mt-4 px-4 py-3 font-extrabold rounded-md cursor-pointer text-[13px] ${active === "paymentButtons" ? "bg-dark-200 text-white-100" : "bg-dark-100 text-white-200"}`}>
                            Payment Buttons
                        </li>
                    </Link>
                    <Link to="/settings" className="w-full">
                        <li className={`w-full mt-4 px-4 py-3 font-extrabold rounded-md cursor-pointer text-[13px] ${active === "settings" ? "bg-dark-200 text-white-100" : "bg-dark-100 text-white-200"}`}>
                            Settings
                        </li>
                    </Link>
                </ul>
            </div>
        </React.Fragment>
    )
}

export default SideBar