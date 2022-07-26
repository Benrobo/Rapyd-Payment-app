import React, { useState, useContext, useEffect } from 'react'
import { Layout, DomHead } from "../components";
import DataContext from '../context/DataContext';
import { Notification } from '../helpers';
import moment from "moment"
import API_ROUTES from '../config/apiRoutes';
import Fetch from '../helpers/fetch';
import { SelectInput } from "../components/UI-COMP";

const notif = new Notification(10000)

const info = localStorage.getItem("raypal") === null ? null : JSON.parse(localStorage.getItem("raypal"));

function Dashboard() {
    const { isAuthenticated, user } = useContext(DataContext)
    const [active, setActive] = useState(false)
    const [data, setData] = useState({
        balance: null,
        linksCount: 0,
        transactionsCount: 0
    })
    const [loader, setLoader] = useState({
        balance: false,
        links: false,
        transactions: false
    })
    const [error, setError] = useState({
        balance: null,
        links: null,
        transactions: null
    })

    const wInfo = localStorage.getItem("walletInfo") === null ? "" : JSON.parse(localStorage.getItem("walletInfo"))
    const { currency, country } = wInfo;
    const [acctBal, setAcctBal] = useState({
        currency: "",
        balance: 0
    })

    // let user = JSON.parse(localStorage.getItem("tymonial"))

    useEffect(() => {
        getPaymentLinks()
        getTransactions()
        getCurrencyBalance()
    }, [])

    async function getPaymentLinks() {
        try {
            setLoader((prev) => ({ ...prev, ["links"]: true }))
            const { res, data } = await Fetch(API_ROUTES.getAllLinks, {
                method: "POST",
            })
            setLoader((prev) => ({ ...prev, ["links"]: false }))

            if (data && data.error) {
                setError((prev) => ({ ...prev, ["links"]: data.message }))
                notif.error(data.message)
                if (res.status === 403) {
                    window.location.reload()
                }
                return
            }

            setData((prev) => ({ ...prev, ["linksCount"]: data?.data.length }))
            // console.log(data);
        }
        catch (e) {
            setLoader((prev) => ({ ...prev, ["links"]: false }))
            setError((prev) => ({ ...prev, ["links"]: e.message }))
        }
    }

    // get transactions
    async function getTransactions() {
        try {
            setLoader((prev) => ({ ...prev, ["transactions"]: true }))
            const { res, data } = await Fetch(API_ROUTES.getWalletTransactions, {
                method: "POST"
            })
            setLoader((prev) => ({ ...prev, ["transactions"]: false }))

            if (data && data.error) {
                setError((prev) => ({ ...prev, ["transactions"]: data.message }))
                notif.error(data.message)
                if (res.status === 403) {
                    window.location.reload()
                }
                return
            }

            setData((prev) => ({ ...prev, ["transactionsCount"]: data?.data.length }))
            // console.log(data);
        }
        catch (e) {
            setLoader((prev) => ({ ...prev, ["transactions"]: false }))
            setError((prev) => ({ ...prev, ["transactions"]: e.message }))
        }
    }

    // get wallet transactions
    async function getCurrencyBalance() {
        if (info.id === undefined || info === null) return
        try {
            setLoader((prev) => ({ ...prev, ["balance"]: true }))
            const url = `${API_ROUTES.getWalletInfo}/${info.id}`
            const { res, data } = await Fetch(url, {
                method: "POST"
            })
            setLoader((prev) => ({ ...prev, ["balance"]: false }))

            if (data && data.error) {
                setError((prev) => ({ ...prev, ["balance"]: data.message }))
                notif.error(data.message)
                if (res.status === 403) {
                    window.location.reload()
                }
                return
            }

            const walletData = data?.data;
            setData((prev) => ({ ...prev, ["balance"]: walletData }))
            // console.log(data);
        }
        catch (e) {
            setLoader((prev) => ({ ...prev, ["balance"]: false }))
            setError((prev) => ({ ...prev, ["balance"]: e.message }))
        }
    }

    useEffect(() => {
        console.log(loader)
        if (loader.balance === false) {
            computeCurrencyBalance()
        }
    }, [data.balance, setData])

    const computeCurrencyBalance = () => {
        // return console.log(data.balance);
        console.log(data.balance)
        if (data.balance !== null && Object.entries(data.balance).length === 0) {
            return setAcctBal((prev) => ({ ...prev, ["currency"]: currency, ["balance"]: 0 }))
        }
        data.balance?.accounts.map((acct, i) => {
            setAcctBal((prev) => ({ ...prev, ["currency"]: acct.currency, ["balance"]: acct.balance }))
        })
    }

    const handleAcctBal = (e) => {
        let value = e.target.value;
        if (data.balance !== null && data.balance?.accounts.length === 0) {
            return setAcctBal((prev) => ({ ...prev, ["currency"]: currency, ["balance"]: 0 }))
        }
        data.balance?.accounts.map((acct, i) => {
            if (acct.currency === value) {
                setAcctBal((prev) => ({ ...prev, ["currency"]: acct.currency, ["balance"]: acct.balance }))
            }
        })
    }

    return (
        <Layout sideBarActiveName="dashboard">
            <div className="relative  flex flex-col items-start justify-start w-full h-screen">
                <div id="head" className="p-5 w-full border-b-[.8px] border-solid border-b-white-300 flex flex-row items-center justify-between gap-10 ">
                    <div className="w-auto ml-5">
                        <p className="text-dark-300 text-[30px] ">Welcome Back</p>
                        <p className="text-white-400 text-[20px] font-bold ">{user.username}</p>
                    </div>
                    <div className="w-auto mr-10">
                        <p className="text-dark-300 text-[30px] ">Balance</p>
                        {
                            loader.balance ?
                                <p className="ml-1 text-dark-200 font-extrabold text-[15px] capitalize ">
                                    Loading...
                                </p>
                                :
                                <p className="text-dark-100 text-[35px] font-extrabold ">
                                    <span id="currency" className="text-dark-100 text-[20px] ">{acctBal.currency}</span> {acctBal.balance}
                                </p>
                        }
                    </div>
                </div>
                <br />
                <div className="w-full h-auto flex items-start justify-start gap-10 px-4">
                    <div id="cards" className="w-[300px] flex flex-col items-start justify-center h-[180px] p-5 rounded-md bg-dark-100 relative overflow-hidden">
                        {
                            loader.balance ?

                                <p className="ml-1 text-white-200 font-extrabold text-[15px] capitalize ">
                                    Loading...
                                </p>
                                :
                                error.balance !== null ?
                                    <p className="ml-1 text-white-200 font-extrabold text-[15px] capitalize ">
                                        {error.balance}
                                    </p>
                                    :
                                    error.balance === null && data.balance?.verification_status === "verified" ?
                                        <>
                                            <select className="w-full h-auto px-3 py-2 mt-1 rounded-md bg-dark-200 text-white-100" onChange={handleAcctBal}>
                                                <option value="">Currencies Balance</option>
                                                {
                                                    data.balance?.accounts.length === 0 ?
                                                        <option value=""></option>
                                                        :
                                                        data.balance?.accounts.map((list, i) => (
                                                            <option key={i} value={list.currency} className="capitalize">
                                                                {list.currency}
                                                            </option>
                                                        ))
                                                }
                                            </select>
                                            <br />
                                            <small className='text-white-200'>Total Balance</small>
                                            <p className="text-white-100 text-[40px] font-extrabold ">
                                                <span className="text-white-200 text-[20px] ">{acctBal.currency}</span> {acctBal.balance}
                                            </p>
                                        </>
                                        :
                                        <>
                                            <div className="w-[160px] flex flex-col items-center justify-center absolute top-[30px] right-[-40px] translate-y-1 translate-x-1 bg-red-200 px-3 py-1 rotate-[55deg] ">
                                                <span className="text-[12px] text-white-100 ">Verify Wallet</span>
                                            </div>
                                            <p className="ml-1 text-white-200 font-extrabold text-[18px] capitalize ">
                                                Currency Balance
                                            </p>
                                        </>
                        }
                    </div>
                    <div id="cards" className="w-[300px] h-[180px] flex flex-col items-start justify-center p-5 rounded-md border-[2px] border-solid border-white-400 relative overflow-hidden ">
                        {
                            loader.balance || loader.transactions ?

                                <p className="ml-1 text-dark-100 font-extrabold text-[15px] capitalize ">
                                    Loading...
                                </p>
                                :
                                error.transactions !== null ?
                                    <p className="ml-1 text-white-200 font-extrabold text-[15px] capitalize ">
                                        {error.transactions}
                                    </p>
                                    :
                                    data.balance?.verification_status === "verified" ?
                                        <>
                                            <p className="text-dark-200 font-extrabold">All Transactions</p>
                                            <small className="text-dark-100">Total Transactions Recieved.</small>
                                            <br />
                                            <br />
                                            <p className="text-dark-100 text-[40px] font-extrabold ">
                                                {data.transactionsCount}
                                            </p>
                                        </>
                                        :
                                        <>
                                            <div className="w-[160px] flex flex-col items-center justify-center absolute top-[30px] right-[-40px] translate-y-1 translate-x-1 bg-red-200 px-3 py-1 rotate-[55deg] ">
                                                <span className="text-[12px] text-white-100 ">Verify Wallet</span>
                                            </div>
                                            <p className="ml-1 text-dark-100 font-extrabold text-[18px] capitalize ">
                                                Total  Transactions
                                            </p>
                                        </>
                        }
                    </div>
                    <div id="cards" className="w-[300px] h-[180px] flex flex-col items-start justify-center p-5 rounded-md border-[2px] border-solid border-white-400 relative overflow-hidden ">
                        {
                            loader.balance || loader.links ?

                                <p className="ml-1 text-dark-100 font-extrabold text-[15px] capitalize ">
                                    Loading...
                                </p>
                                :
                                error.links !== null ?
                                    <p className="ml-1 text-white-200 font-extrabold text-[15px] capitalize ">
                                        {error.links}
                                    </p>
                                    :
                                    error.links === null && data.balance?.verification_status === "verified" ?
                                        <>
                                            <p className="text-dark-200 font-extrabold">Payments Links</p>
                                            <small className='text-dark-100 font-extrabold'>Created payment links.</small>
                                            <br />
                                            <br />
                                            <p className="text-dark-100 text-[40px] font-extrabold ">
                                                {data.linksCount}
                                            </p>
                                        </>
                                        :
                                        <>
                                            <div className="w-[160px] flex flex-col items-center justify-center absolute top-[30px] right-[-40px] translate-y-1 translate-x-1 bg-red-200 px-3 py-1 rotate-[55deg] ">
                                                <span className="text-[12px] text-white-100 ">Verify Wallet</span>
                                            </div>
                                            <p className="ml-1 text-dark-100 font-extrabold text-[18px] capitalize ">
                                                Created Payment Links
                                            </p>
                                        </>
                        }
                    </div>
                    {/* <div id="cards" className="w-[300px] h-[180px] p-5 rounded-md border-[2px] border-solid border-white-400 ">
                        <select name="" id="" className="w-full rounded-md bg-dark-300 text-white-100 px-3 py-1">
                            <option value="">wallet_xxx</option>
                        </select>
                        <small className='text-dark-100 font-extrabold'>Your wallet balance</small>
                        <br />
                        <br />
                        <p className="text-dark-100 text-[40px] font-extrabold ">
                            <span className="text-dark-200 text-[20px] ">$</span> 500
                        </p>
                    </div> */}
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard
