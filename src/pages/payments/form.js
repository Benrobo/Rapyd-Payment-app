import React, { useState, useEffect } from 'react'
import { useParams } from "react-router"
import { Layout, Loader } from "../../components";
import {
    Button,
    Input,
    StatusState,
    SelectInput,
} from "../../components/UI-COMP";
import { GoVerified } from "react-icons/go"
import { BiCopy, BiTrash, BiCheckCircle, BiErrorAlt } from "react-icons/bi"
import { GiWallet } from "react-icons/gi"
import { Notification, sleep } from "../../helpers"
import Fetch from "../../helpers/fetch"
import API_ROUTES from "../../config/apiRoutes"
import supportedCountries from "../../data/supported_countries.json"
import convertCurrency from '../../helpers/convertCurrency';

const notif = new Notification(10000)



function PaymentForm() {

    let issuedId = localStorage.getItem("issued_id") === null ? undefined : JSON.parse(localStorage.getItem("issued_id"))
    const { linkId } = useParams()
    const [isModalVisi, setIsModalVisi] = useState(false)
    const [isPayDetailModalVisi, setIsPayDetailModalVisi] = useState(false)
    const [loader, setLoader] = useState({
        iban: false,
        payment: false,
        link: false,
        currencyConverter: false
    })
    const [error, setError] = useState({
        iban: null,
        payment: null,
        link: null
    })
    const [paymentData, setPaymentData] = useState({})
    const [vanData, setVanData] = useState({})
    const [input, setInput] = useState({
        fName: "",
        lName: "",
        email: "",
        amount: "",
        issued_id: "",
        mainAmount: 0
    })

    const [steps, setSteps] = useState({
        prev: true,
        next: false
    })
    const [prevTransactions, setPrevTransactions] = useState([])
    const [currentBalance, setCurrentBalance] = useState(0)
    const [prevPayment, setPrevPayment] = useState({
        currentBalance: 0,
        prevPaidAmount: 0,
        mainConvertedAmount: 0
    })
    const { search } = window.location;
    const queryString = search.split("=")[1]

    const toggleSteps = (action) => {
        if (action === "next") {
            setSteps((prev) => ({ ...prev, ["prev"]: false, ["next"]: true }))
        }
        if (action === "prev") {
            setSteps((prev) => ({ ...prev, ["prev"]: true, ["next"]: false }))
        }
    }

    // const [paymentDetails, setPaymentDetails] = useState({
    //     country: "",
    //     currency: ""
    // })

    const toggleModal = () => setIsModalVisi(!isModalVisi)

    const togglePayDetailModal = () => setIsPayDetailModalVisi(!isPayDetailModalVisi)

    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({ ...prev, [name]: value }))
    }


    useEffect(() => {
        fetchPaymentLinkData()

        // if (prevTransactions.length > 0) {
        //     const filterBalance = prevTransactions.map((data) => data.amount).reduce((total, acc) => {
        //         return total += acc
        //     }, 0)
        //     const filterCurrency = prevTransactions.map((data) => data.currency)[0]

        //     const newBalance = paymentData.amount - filterBalance;
        //     console.log(newBalance, filterCurrency)
        //     // setCurrentBalance(filter)
        // }
    }, [])

    useEffect(() => {

        if (prevTransactions.length > 0) {
            (async () => {
                const filterBalance = prevTransactions.length > 0 && prevTransactions.map((data) => data.amount).reduce((total, acc) => {
                    return total += acc
                }, 0)

                const currency = prevTransactions.map((data) => data.currency)[0]
                const convertMainAmount = async () => {
                    setLoader((prev) => ({ ...prev, ["currencyConverter"]: true }))
                    const currencyData = await convertCurrency(paymentData.currency, currency, paymentData?.amount)
                    setLoader((prev) => ({ ...prev, ["currencyConverter"]: false }))
                    if (currencyData.error !== null) {
                        return notif.error(currencyData.error)
                    }
                    const { converted_amount } = currencyData.data;
                    return Math.round(converted_amount)
                }

                const convertedMainAmount = await convertMainAmount()
                const currentBal = convertedMainAmount - filterBalance;

                setPrevPayment((prev) => ({ ...prev, ["currentBalance"]: currentBal < 1 ? 0 : currentBal, ["prevPaidAmount"]: filterBalance, ["mainConvertedAmount"]: convertedMainAmount }))
            })()
        }
    }, [prevTransactions.length, paymentData.amount])


    // continue payment
    async function continuePayment() {
        const { fName, lName, email } = input;
        const { currency, country } = paymentData;
        if (fName === "") return notif.error("first name is missing.")
        if (lName === "") return notif.error("last name is missing.")
        if (email === "") return notif.error("email is missing.")
        if (currency === "") return notif.error("currency is missing.")
        if (country === "") return notif.error("country is missing.")
        // console.log(paymentData)
        await requestIBAN(country, currency)
        toggleSteps("next")
    }

    // request iban number
    async function requestIBAN(country, currency) {
        const url = `${API_ROUTES.issueIban}/${linkId}${queryString === "" || typeof queryString === "undefined" || queryString.includes("issuing") === false ? "" : `?accountId=${queryString}`}`
        console.log(queryString, url)
        const body = {
            country,
            currency,
            description: "Issue virtual account number to wallet.",
            email: input.email,
            first_name: input.fName,
            last_name: input.lName,
            accountId: typeof vanData.currency !== "undefined" && currency !== vanData?.currency ? "" : queryString || issuedId
        }
        // return console.log(body, vanData)
        try {
            setLoader((prev) => ({ ...prev, ["iban"]: true }))
            const { res, data } = await Fetch(url, {
                method: "POST",
                body: JSON.stringify(body)
            })
            setLoader((prev) => ({ ...prev, ["iban"]: false }))

            if (data && data.success === false) {
                notif.error(data.message)
                return setError((prev) => ({ ...prev, ["iban"]: data.message }))
            }

            setVanData(data.data)
            // console.log("VAN", { country, currency, paymentData }, data.data)
            setInput((prev) => ({ ...prev, ["issued_id"]: data.data?.id }))
            const issuedId = data.data?.id;
            setPrevTransactions(data.data?.transactions)
            localStorage.setItem("issued_id", JSON.stringify(issuedId))
        } catch (e) {
            console.log(e);
            setLoader((prev) => ({ ...prev, ["iban"]: false }))
            return setError((prev) => ({ ...prev, ["iban"]: e.message }))
        }
    }

    // get paymentLink data
    async function fetchPaymentLinkData() {
        const { search } = window.location;
        const queryString = search.split("=")[1] || ''
        try {
            setLoader((prev) => ({ ...prev, ["link"]: true }))
            const url = `${API_ROUTES.getLinkById}/${linkId}`
            const { res, data } = await Fetch(url, {
                method: "GET"
            })
            setLoader((prev) => ({ ...prev, ["link"]: false }))

            if (data && data.success === false) {
                notif.error(data.message)
                return setError((prev) => ({ ...prev, ["link"]: data.message }))
            }

            setPaymentData(data.data)
            setInput((prev) => ({ ...prev, ["mainAmount"]: data.data?.amount }))

            // console.log(typeof issuedId !== "undefined", typeof queryString !== "undefined" && queryString.includes("issuing"))
            if (typeof queryString !== "undefined" && queryString.includes("issuing")) {
                console.log("QUERY STRING EXISTS EXISTS")
                return requestIBAN(data.data?.country, data.data?.currency)
            }
            else if (typeof issuedId !== "undefined") {
                console.log("ISSUE ID EXISTS", issuedId, typeof issuedId)
                return requestIBAN(data.data?.country, data.data?.currency)
            }
        } catch (e) {
            console.log(e);
            setLoader((prev) => ({ ...prev, ["link"]: false }))
            return setError((prev) => ({ ...prev, ["link"]: e.message }))
        }
    }

    async function makePayment() {

        const { mainConvertedAmount, prevPaidAmount, currentBalance } = prevPayment;
        // check if payment is completed and user isnt owing
        if ((currentBalance === 0 && mainConvertedAmount > 0) && (prevPaidAmount >= mainConvertedAmount)) {
            localStorage.clear()
            const check = window.confirm("Payment has been completed, are you sure you want to continue?")
            if (check === false) return;
        }
        const { fName, lName, email, issued_id, amount } = input;
        setVanData((prev) => ({ ...prev, ["amount"]: amount }))

        if (prevTransactions.length === 0) {
            if (fName === "") return notif.error("first name cant be empmty")
            if (lName === "") return notif.error("last name cant be empmty")
            if (email === "") return notif.error("email cant be empmty")
            if (amount === "") return notif.error("deposited Amount cant be empmty")

            try {
                setLoader((prev) => ({ ...prev, ["payment"]: true }))
                const body = {
                    first_name: fName,
                    last_name: lName,
                    email,
                    amount,
                    issued_bank_account: issued_id,
                    currency: vanData?.currency,
                    country: vanData?.bank_account.country_iso
                }

                const { res, data } = await Fetch(API_ROUTES.makePayment, {
                    method: "POST",
                    body: JSON.stringify(body)
                })
                setLoader((prev) => ({ ...prev, ["payment"]: false }))

                if (data && data.success === false) {
                    notif.error(data.message)
                    return setError((prev) => ({ ...prev, ["payment"]: data.message }))
                }

                console.log(data)
                toggleModal()
                setError((prev) => ({ ...prev, ["payment"]: null }))
            } catch (e) {
                setLoader((prev) => ({ ...prev, ["payment"]: false }))
                setError((prev) => ({ ...prev, ["payment"]: e.message }))
            }

        }

        if (prevTransactions.length > 0) {
            if (amount === "") return notif.error("deposited Amount cant be empmty")

            // return console.log(input);

            try {
                setLoader((prev) => ({ ...prev, ["payment"]: true }))
                const body = {
                    amount,
                    issued_bank_account: issued_id || issuedId,
                    currency: vanData?.currency,
                    country: vanData?.bank_account.country_iso
                }
                const { res, data } = await Fetch(API_ROUTES.makePayment, {
                    method: "POST",
                    body: JSON.stringify(body)
                })
                setLoader((prev) => ({ ...prev, ["payment"]: false }))

                if (data && data.success === false) {
                    notif.error(data.message)
                    return setError((prev) => ({ ...prev, ["payment"]: data.message }))
                }

                console.log(data)
                toggleModal()
                setError((prev) => ({ ...prev, ["payment"]: null }))
            } catch (e) {
                setLoader((prev) => ({ ...prev, ["payment"]: false }))
                setError((prev) => ({ ...prev, ["payment"]: e.message }))
            }

        }
    }


    const upDateSelectedPaymentDetails = async (country, currency) => {
        setLoader((prev) => ({ ...prev, ["currencyConverter"]: true }))
        const currencyData = await convertCurrency(paymentData.currency, currency, paymentData.amount)
        setLoader((prev) => ({ ...prev, ["currencyConverter"]: false }))
        if (currencyData.error !== null) {
            return notif.error(currencyData.error)
        }
        const { data } = currencyData;
        setPaymentData((prev) => ({ ...prev, ["currency"]: currency, ["country"]: country, ["amount"]: Math.round(data?.converted_amount) }))
        if (prevTransactions.length > 0) requestIBAN(country, currency)
        // if (queryString !== "") 
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-white-200 overflow-y-scroll pb-9  ">
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            {
                loader.link ?
                    <Loader type="loading" text="Loading Link Data" />
                    :
                    error.link !== null ?
                        <Loader type="message" text={error.link} />
                        :
                        Object.entries(paymentData).length === 0 ?
                            <ErrorComp />
                            :
                            paymentData?.active === false || typeof paymentData.active === "undefined" ?
                                <ErrorComp />
                                :
                                <div id="form" className="w-[450px] h-auto bg-white-100 shadow-lg rounded-md mt-10">
                                    <div id="main" className="w-full h-auto flex flex-col items-center justify-center mt-5 relative">
                                        <div className="w-auto p-2 border-2 border-grey rounded-[50%] flex flex-col items-center justify-center ">
                                            <GiWallet className="p-4 text-[90px] text-dark-300" />
                                        </div>
                                        <br />
                                        <p className="text-dark-100 text-[15px] font-extrabold capitalize ">
                                            {paymentData?.title}
                                        </p>
                                        <br />
                                        {
                                            loader.currencyConverter ?
                                                <p className="text-dark-100 text-[15px] font-extrabold capitalize ">
                                                    Converting...
                                                </p>
                                                :
                                                <>
                                                    <p className="text-dark-100 font-extrabold text-[30px] ">
                                                        <span className="text-dark-400 text-[15px] ">{paymentData?.currency}</span> {paymentData?.amount}
                                                    </p>
                                                    {/* {console.log(typeof queryString)} */}
                                                    {prevTransactions.length > 0 &&
                                                        <p className="text-dark-100 font-extrabold text-[20px] ">
                                                            {
                                                                (prevPayment.currentBalance === 0 && prevPayment.mainConvertedAmount > 0) && (prevPayment.prevPaidAmount >= prevPayment.mainConvertedAmount) ?
                                                                    <span className="text-dark-400 text-[15px] text-green-500 flex flex-row items-center items-start justify-start " style={{ color: "green" }}>
                                                                        <BiCheckCircle className="p-3 text-[50px] text-green-400" style={{ color: "green" }} /> Payment Completed
                                                                    </span>
                                                                    :
                                                                    <span className="text-dark-400 text-[15px] ">
                                                                        {vanData?.currency} <span className="text-green-100 text-[20px] font-extrabold ml-3" style={{ color: "green" }}>+ {prevPayment.prevPaidAmount}</span>

                                                                        <span className="text-red-100 text-[20px] font-extrabold ml-5" style={{ color: "red" }}> - {Math.floor(prevPayment.currentBalance)}</span>
                                                                    </span>
                                                            }
                                                        </p>
                                                    }
                                                </>
                                        }
                                    </div>
                                    {
                                        steps.prev && loader.iban ?
                                            <Loader type="loading" text="" />
                                            :
                                            steps.prev && prevTransactions.length === 0 ?
                                                <div className="mt-4 p-5 flex flex-col items-center justify-center">
                                                    <button disabled={loader.currencyConverter} className={`btn px-4 py-4 rounded-md font-extrabold text-white-100 bg-white-400 scale-[.70] ${loader.currencyConverter ? "cursor-not-allowed" : "cursor-pointer"} `} onClick={togglePayDetailModal} hidden>
                                                        Change Currency
                                                    </button>
                                                    <br />
                                                    <div className="w-full flex flex-row items-center justify-between gap-4 relative">
                                                        <div className="w-auto flex flex-col items-start justify-start">
                                                            <label className="text-dark-100 text-[15px] font-extrabold ">First Name</label>
                                                            <input className={`w-full rounded-md ourtline-none bg-white-100 px-3 py-3 mt-2 text-dark-200 border-2 border-grey-100 `} placeholder="John" name="fName" value={input.fName} onChange={handleInput} />
                                                        </div>
                                                        <div className="w-auto flex flex-col items-start justify-start">
                                                            <label className="text-dark-100 text-[15px] font-extrabold ">Last Name</label>
                                                            <input className={`w-full rounded-md ourtline-none bg-white-100 px-3 py-3 mt-2 text-dark-200 border-2 border-grey-100 `} placeholder="Doe" name="lName" value={input.lName} onChange={handleInput} />
                                                        </div>
                                                    </div>
                                                    <br />
                                                    <div className="w-full flex flex-col items-start justify-start">
                                                        <label className="text-dark-100 text-[15px] font-extrabold ">Email</label>
                                                        <input className={`w-full rounded-md ourtline-none bg-white-100 px-3 py-3 mt-2 text-dark-200 border-2 border-grey-100 `} placeholder="johndoe@mail.com" name="email" value={input.email} onChange={handleInput} />
                                                    </div>

                                                    <br />
                                                    <button className={`px-5 text-white-100 bg-dark-100 py-4 font-extrabold rounded-md w-full `} onClick={continuePayment}>
                                                        Continue
                                                    </button>
                                                </div>
                                                :
                                                ""
                                    }
                                    {
                                        steps.next && loader.iban ?
                                            <Loader type="loading" text="Loading Form" />
                                            :
                                            <>
                                                {(steps.next || prevTransactions.length > 0) && <div className="w-full flex flex-col items-center justify-center gap-4 p-3">
                                                    {steps.prev || steps.next && prevTransactions.length === 0 && <div className="w-full flex flex-row items-start justify-start">
                                                        <button
                                                            className={`px-5 py-2 bg-dark-100 text-white-100 text-[15px] scale-[.70] font-extrabold rounded-md`}
                                                            onClick={() => toggleSteps("prev")}
                                                        >
                                                            Back
                                                        </button>
                                                    </div>}
                                                    <div className="w-full h-auto p-2">
                                                        <p className="text-dark-100 w-full flex flex-row items-center justify-between font-extrabold text-[15px] ">
                                                            <span className="text-dark-400 text-[12px] ">Beneficiary Name :</span>
                                                            <span className="text-dark-100 font-extrabold text-[14px] ">{typeof vanData.bank_account?.beneficiary_name === "undefined" ? "N/A" : vanData.bank_account?.beneficiary_name}</span>
                                                        </p>
                                                        <br />
                                                        <p className="text-dark-100 w-full flex flex-row items-center justify-between font-extrabold text-[15px] ">
                                                            <span className="text-dark-400 text-[12px] ">Country ISO:</span>
                                                            <span className="text-dark-100 font-extrabold text-[14px] ">{vanData.bank_account?.country_iso}</span>
                                                        </p>
                                                        <br />
                                                        <p className="text-dark-100 w-full flex flex-row items-center justify-between font-extrabold text-[15px] ">
                                                            <span className="text-dark-400 text-[12px] ">Currency:</span>
                                                            <span className="text-dark-100 font-extrabold text-[14px] ">{vanData?.currency}</span>
                                                        </p>
                                                        <br />
                                                        <p className="text-dark-100 w-full flex flex-row items-center justify-between font-extrabold text-[15px] ">
                                                            <span className="text-dark-400 text-[12px] ">Account Number :</span>
                                                            <span className="text-dark-100 font-extrabold text-[14px] ">{vanData.bank_account?.iban || vanData.bank_account?.account_number || "N/A"}</span>
                                                        </p>
                                                        <br />
                                                        <div className="w-full flex flex-col items-start justify-start">
                                                            <label className="text-dark-100 text-[15px] font-extrabold ">Deposit Fund </label>
                                                            <input className={`w-full rounded-md ourtline-none bg-white-100 px-3 py-3 mt-2 text-dark-200 border-2 border-grey-100 `} placeholder="Deposit fund" type="number" name="amount" onChange={handleInput} min={1} max={paymentData?.amount.toString().length} maxLength={paymentData?.amount.toString().length} />
                                                        </div>
                                                        <br />
                                                        <button className={`px-5 text-white-100 bg-dark-100 py-4 font-extrabold rounded-md w-full `} onClick={makePayment}>
                                                            {loader.payment ? "Making Payment....." : "Make Payment"}
                                                        </button>
                                                    </div>
                                                </div>}
                                            </>
                                    }
                                </div>
            }
            {isModalVisi && <PaymentSuccess toggleModal={toggleModal} prevPayment={prevPayment} message={error.payment} data={vanData} />}

            {isPayDetailModalVisi && <UpdatePaymentDetail upDateSelectedPaymentDetails={upDateSelectedPaymentDetails} toggleModal={togglePayDetailModal} />}
        </div>
    )
}

export default PaymentForm



function UpdatePaymentDetail({ upDateSelectedPaymentDetails, toggleModal }) {

    const [countries, setCountries] = useState([])
    const [linkData, setLinkData] = useState({
        country: "",
        currency: "",
    })
    const [selectedCountry, setSelectedCountry] = useState("")
    const [selectedCountryData, setSelectedCountryData] = useState([])

    useEffect(() => {
        let store = []
        for (const key in supportedCountries) {
            store.push(key)
        }
        setCountries(store)
    }, [])

    const handleInputs = (e) => {
        const name = e.target.name;
        const value = e.target.value
        setLinkData((prev) => ({ ...prev, [name]: value }))
        if (name === "country") setSelectedCountry(value)
    }

    // handle selected countries
    useEffect(() => {
        if (selectedCountry !== "") {
            let currencies;
            for (const key in supportedCountries) {
                if (key === selectedCountry) {
                    currencies = supportedCountries[key]
                }
            }
            setSelectedCountryData(currencies)
        }
    }, [selectedCountry])

    return (
        <div className="w-full h-screen bg-dark-400 absolute top-0 flex flex-col items-center justify-center">
            <div id="box" className="w-[350px] h-auto rounded-md bg-white-100 flex flex-col items-center justify-center ">
                <div id="head" className="w-full flex flex-row items-center justify-between bg-grey-100 border-b-[2px] border-b-grey p-6 ">
                    <div className="w-auto flex flex-col items-start justify-start">
                        <p className="text-dark-100 font-extrabold text-[15px] ">Update Payment Detail</p>
                    </div>
                    <button
                        className="px-4 py-2 bg-dark-300 text-white-200 scale-[.60] rounded-md cursor-pointer "
                        onClick={toggleModal}
                    >
                        Close
                    </button>
                </div>
                <div className="w-full p-6 flex flex-row items-center justify-between gap-5">
                    <div className="w-auto h-auto flex flex-col items-start justify-start border-b-[1px] border-b-grey-100 ">
                        <label className="text-dark-100 font-extrabold text-[15px] ">Countries</label>
                        <select className="w-full h-auto px-3 py-2 mt-2 rounded-md bg-dark-200 text-white-100" name="country" onChange={handleInputs}>
                            <option value="">Countries</option>
                            {countries.map((list, i) => (
                                <option key={i} value={list} className="">
                                    {list}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-auto h-auto flex flex-col items-start justify-start border-b-[1px] border-b-grey-100 ">
                        <label className="text-dark-100 font-extrabold text-[15px] ">Currencies</label>
                        <select className="w-full h-auto px-3 py-2 mt-2 rounded-md bg-dark-200 text-white-100" name="currency" onChange={handleInputs} disabled={selectedCountryData.length === 0 ? true : false} >
                            <option value="">Currencies</option>
                            {selectedCountryData.map((currency, i) => (
                                <option key={i} value={currency} className="">
                                    {currency}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="w-full flex flex-row items-center justify-between gap-7 p-6">
                    <Button text="Close" type='danger' onClick={toggleModal} />
                    <Button text="Update" type='secondary' onClick={() => {
                        upDateSelectedPaymentDetails(linkData.country, linkData.currency)
                        toggleModal()
                    }} />
                </div>
            </div>
        </div>
    )
}

function ErrorComp({ msg }) {

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center text-center">
            <p className="text-dark-100 text-[25px] font-extrabold capitalize ">
                Oops, Something went wrong.
            </p>
            <p className="text-dark-400 text-[15px] font-semibold text-center capitalize ">
                {
                    msg === "" || typeof msg === "undefined" ?
                        <>
                            looks like this link has been  <span className="text-dark-100 font-extrabold">Removed or Disabled</span> by merchants
                        </>
                        :
                        <span className="text-dark-100 font-extrabold">{msg}</span>
                }
            </p>
        </div>
    )
}


function PaymentSuccess({ toggleModal, message, data }) {

    return (
        <div className="w-full h-screen bg-dark-400 absolute top-0 flex flex-col items-center justify-center">
            <div id="box" className="w-[400px] h-auto rounded-md bg-white-100 p-7 flex flex-col items-center justify-center ">
                <div className="w-auto p-2 flex flex-col items-center justify-center ">
                    {message === null && <BiCheckCircle className="p-3 text-[90px] text-green-400" />}
                    {message !== null && <BiErrorAlt className="p-3 text-[90px] text-red-200" />}
                </div>
                <p className="text-dark-100 text-[20px] font-extrabold capitalize ">
                    {message !== null ? "Something went wrong" : "Payment Successfull "}
                </p>
                <br />
                <p className="text-dark-400 text-[12px] font-semibold text-center capitalize ">
                    {
                        message === null ?
                            <>
                                payment made for <span className="text-dark-100 font-extrabold">{data?.currency} {data.amount}</span> was successfull. Check your email address for proof.
                            </>
                            :
                            <>
                                <span className="text-dark-100 font-extrabold">{message}</span>
                            </>
                    }
                </p>
                <br />
                <div className="w-full flex flex-row items-center justify-between gap-5">
                    <Button text="Continue Later" type='secondary' onClick={async () => {
                        toggleModal()
                        localStorage.clear()
                        window.location.reload()
                    }} />
                    <Button text="Continue" type='primary' onClick={async () => {
                        toggleModal()
                        window.location.reload()
                    }} />
                </div>
            </div>
        </div>
    )
}