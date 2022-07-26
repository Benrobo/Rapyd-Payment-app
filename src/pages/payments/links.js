import React, { useState, useEffect } from 'react'
import { Layout, Loader } from "../../components";
import {
    Button,
    Input,
    StatusState,
    SelectInput,
} from "../../components/UI-COMP";
import { GoVerified } from "react-icons/go"
import { BiCopy, BiQrScan, BiTrash } from "react-icons/bi"
import { GiWallet } from "react-icons/gi"
import { Notification, sleep } from "../../helpers"
import Fetch from "../../helpers/fetch"
import API_ROUTES from "../../config/apiRoutes"
import supportedCountries from "../../data/supported_countries.json"
import moment from "moment"
import { QRCode } from 'react-qrcode'

const notif = new Notification(10000)


const walletStatus = localStorage.getItem("wallet-status") === null ? null : JSON.parse(localStorage.getItem("wallet-status"))

function PaymentLinks() {

    const [isLinkOpen, setIsLinkOpened] = useState(false)
    const [isLinkFormOpen, setIsLinkFormOpened] = useState(false)
    const [selectedLinkId, setSelectedLinkId] = useState("")
    const [loading, setLoading] = useState(false)
    const [links, setLinks] = useState([])
    const [error, setError] = useState(null)
    const [linkData, setLinkData] = useState({})


    useEffect(() => {
        fetchPaymentLinks()
    }, [])

    async function fetchPaymentLinks() {
        try {
            setLoading(true)
            const { res, data } = await Fetch(API_ROUTES.getAllLinks, {
                method: "POST",
            });
            setLoading(false)

            if (data && data.success === false) {
                return setError(data.message)
            }

            setLinks(data?.data)
        } catch (e) {
            console.log(e);
            setLoading(false)
            setError(e.message)
        }

    }


    const toggleLinkVisi = (e, type) => {
        let dataset = e.target.dataset;
        if (Object.entries(dataset).length > 0) {
            const { id } = dataset;
            const selLink = links.filter((data) => data.id === id)[0]
            setLinkData(selLink)
            setSelectedLinkId(id)
            setIsLinkOpened(!isLinkOpen)
            return
        }
        if (type === "open" || type === "close") setIsLinkOpened(!isLinkOpen)
    }
    const toggleFormLinkVisi = () => setIsLinkFormOpened(!isLinkFormOpen)

    return (
        <Layout sideBarActiveName="paymentLinks">
            {
                walletStatus?.verified === "not verified" ?
                    <Loader type='message' text='Verify your wallet to create payment links.' />
                    :
                    <div className="relative w-full h-screen">
                        <div id="head" className="w-full h-auto border-b-[1px] border-b-grey-100 p-3 flex flex-row items-center justify-between">
                            <div className="w-auto">
                                <p className="text-dark-100 font-extrabold text-[20px] ">Payment Links</p>
                                <p className="text-dark-100 text-[15px] ">create and send payment links to customers.</p>
                            </div>
                            <div className="w-auto">
                                <Button text="Add Links" style={{ transform: "scale(.80)" }} onClick={toggleFormLinkVisi} />
                            </div>
                        </div>
                        <div id="body" className="w-full h-screen overflow-y-scroll">
                            {
                                false ? <div className="w-full h-screen flex flex-col items-center justify-start">
                                    <div id="box" className="w-auto h-full p-3 flex flex-col items-center justify-center">
                                        <Button text="Verify Wallet" style={{ transform: "scale(.85)" }} />
                                        <p className="text-dark-100 text-[15px] mt-2">Verify your wallet to create payment links..</p>
                                    </div>
                                </div>
                                    :
                                    <Links toggleLinkVisi={toggleLinkVisi} links={links} loading={loading} error={error} />
                            }
                        </div>

                        {isLinkOpen && <ViewLink isLinkOpen={isLinkOpen} linkId={selectedLinkId} toggleLinkVisi={toggleLinkVisi} linkData={linkData} />}
                        {isLinkFormOpen && <AddLink toggleFormLinkVisi={toggleFormLinkVisi} />}
                    </div>
            }
        </Layout>
    )
}

export default PaymentLinks

function AddLink({ toggleFormLinkVisi }) {

    // const [steps, setSteps] = useState(1)
    const { country, currency } = localStorage.getItem("walletInfo") === null ? "" : JSON.parse(localStorage.getItem("walletInfo"))
    const [countries, setCountries] = useState([])
    const [linkData, setLinkData] = useState({
        country,
        currency,
        amount: "",
        title: "",
    })
    const [loading, setLoading] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState("")
    const [selectedCountryData, setSelectedCountryData] = useState([])

    useEffect(() => {
        let store = []
        for (const key in supportedCountries) {
            store.push(key)
        }
        setCountries(store)
    }, [])

    // const nextStep = () => {
    //     const { country, currency, amount, title, iban } = linkData;

    //     if (steps === 1) {
    //         if (country === "") return notif.error("country cant be empty")
    //         if (currency === "") return notif.error("currency cant be empty")
    //         if (title === "") return notif.error("title cant be empty")
    //         if (amount === "") return notif.error("amount cant be empty")
    //         setSteps((prev) => (prev += 1))
    //     }
    //     if (steps === 2) {
    //         if (iban === "") return notif.error("iban number cant be empty")
    //         setSteps((prev) => (prev += 1))
    //     }
    // }
    // const prevStep = () => setSteps((prev) => (prev <= 1 ? prev = 1 : prev -= 1))

    const handleInputs = (e) => {
        const name = e.target.name;
        const value = e.target.value
        console.log(typeof parseInt(value), value);
        setLinkData((prev) => ({ ...prev, [name]: typeof value === "number" && value < 1 ? 1 : value }))
        if (name === "country") {
            setSelectedCountry(value)
        }
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

    async function createPaymentLink() {
        const { country, currency, amount, title } = linkData;
        if (title === "") return notif.error("title cant be empty")
        if (country === "") return notif.error("country cant be empty")
        if (currency === "") return notif.error("currency cant be empty")
        if (amount === "") return notif.error("amount cant be empty")

        try {
            setLoading(true)
            const { res, data } = await Fetch(API_ROUTES.createLink, {
                method: "POST",
                body: JSON.stringify(linkData)
            });
            setLoading(false)

            if (data && data.success === false) {
                console.log(data);
                return notif.error(data.message)
            }

            notif.success(data.message)
            await sleep(1)
            window.location.reload()
        } catch (e) {
            console.log(e);
            setLoading(false)
            notif.error(e.message)
        }

    }



    return (
        <div className="w-full h-screen flex flex-col items-center justify-center fixed top-0 left-0 bg-dark-400 ">

            <div id="card" className={`w-[400px] transition-all bg-white-100 overflow-hidden rounded-md `}>
                <div id="head" className="w-full flex flex-row items-center justify-between bg-grey-100 border-b-[1px] border-b-grey p-2 ">
                    <div className="w-auto flex flex-col items-start justify-start">
                        <p className="text-dark-100 font-extrabold text-[15px] ">Add Payment Links</p>
                    </div>
                    <button
                        className="px-4 py-2 bg-dark-300 text-white-200 scale-[.60] rounded-md cursor-pointer "
                        onClick={toggleFormLinkVisi}
                    >
                        Close
                    </button>
                </div>
                <div id="details" className="w-full mt-3 p-6">
                    <div className="w-full h-auto flex flex-col items-center justify-center">
                        <div className="w-full h-auto flex flex-col items-start justify-start border-b-[1px] border-b-grey-100 ">
                            <label className="text-dark-100 text-[15px] ">Link Title</label>
                            <Input placeHolder="Link Title" name="title" value={linkData.title} onChange={handleInputs} />
                        </div>
                        <br />
                        <div className="w-full h-auto flex flex-col items-start justify-start border-b-[1px] border-b-grey-100 ">
                            <label className="text-dark-100 text-[15px] ">Amount</label>
                            <Input placeHolder="50" value={linkData.amount} type="number" name="amount" onChange={handleInputs} min={1} />
                        </div>
                        <br />
                        <div id="flex" className="w-full flex flex-row items-center justify-between gap-2">
                            <Button type="secondary" text={loading ? "Creating Link...." : "Create Link"} onClick={createPaymentLink} long={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Links({ toggleLinkVisi, links, loading, error }) {

    return (
        <div className="p-5 w-full mt-5">
            {
                loading ?
                    <Loader type='loading' text='Loading Payment Links.' />
                    :
                    error !== null ?
                        <Loader type='error' text={error} />
                        :
                        links.length === 0 ?
                            <Loader type="message" text={"No Payment links available."} />
                            :
                            <table className="w-full table table-auto ">
                                <thead className="w-full bg-dark-300">
                                    <tr className="">
                                        <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                                            LINK TITLE
                                        </th>
                                        <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                                            CURRENCY
                                        </th>
                                        <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                                            AMOUNT
                                        </th>
                                        <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                                            CREATED AT
                                        </th>
                                        <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                                            Status
                                        </th>
                                        <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                                            PAYMENT LINK
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="w-full text-start">
                                    {links.map((data, i) => (
                                        <tr className="bg-white-300">
                                            <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                                                {data?.title}
                                            </td>
                                            <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                                                <p className="text-dark-100 font-extrabold">{data.currency}</p>
                                            </td>
                                            <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                                                <p className="text-dark-100 font-extrabold">{data.amount}</p>
                                            </td>
                                            <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                                                {moment(data?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                                            </td>
                                            <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                                                <StatusState state={data?.active ? "pending" : "rejected"} text={data?.active ? "Active" : "Disabled"} />
                                            </td>
                                            <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                                                <button
                                                    className="px-4 py-2 bg-dark-300 text-white-200 scale-[.70] rounded-md cursor-pointer "
                                                    onClick={(e) => toggleLinkVisi(e, "open")}
                                                    data-id={data?.id}
                                                >
                                                    View Link
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
            }
        </div>
    )
}



function ViewLink({ linkData, isLinkOpen, toggleLinkVisi, linkId }) {

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("")
    const [qrcodeActive, setActiveQrcode] = useState(false)

    const { origin } = window.location
    const paymentLink = `${origin}/payment/link/${linkData?.id}`


    const toggleQrcode = () => setActiveQrcode(!qrcodeActive)

    useEffect(() => {
        (async () => {
            if (isLinkOpen) {
                setOpen(true)
                console.log(linkData);
            }
        })()
    }, [])

    const copyLink = () => {
        window.navigator.clipboard.writeText(paymentLink)
        notif.success("Link Copied")
    }

    async function disablePaymentLink() {
        setType("disable")
        try {
            setLoading(true)
            const { res, data } = await Fetch(API_ROUTES.disableLink, {
                method: "PUT",
                body: JSON.stringify({ linkId })
            });
            setLoading(false)

            if (data && data.success === false) {
                return notif.error(data.message)
            }

            notif.success(data.message)
            await sleep(1)
            window.location.reload()
        } catch (e) {
            console.log(e);
            setLoading(false)
            notif.error(e.message)
        }

    }

    async function deletePaymentLink() {
        setType("delete")
        try {
            setLoading(true)
            const { res, data } = await Fetch(API_ROUTES.deleteLink, {
                method: "DELETE",
                body: JSON.stringify({ linkId })
            });
            setLoading(false)

            if (data && data.success === false) {
                return notif.error(data.message)
            }

            notif.success(data.message)
            await sleep(1)
            window.location.reload()
        } catch (e) {
            console.log(e);
            setLoading(false)
            notif.error(e.message)
        }

    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center fixed top-0 left-0 bg-dark-400 ">

            <div id="card" className={`w-[400px] ${open ? "h-[95%]" : "h-0"} transition-all absolute bottom-0 bg-white-100 overflow-hidden `}>
                <div id="head" className="w-full flex flex-row items-center justify-between bg-grey-100 border-b-[1px] border-b-grey p-2 ">
                    <div className="w-auto flex flex-col items-start justify-start">
                        <p className="text-dark-100 font-extrabold text-[15px] ">Payment Link</p>
                        <p className="text-dark-400 font-bold text-[12px] ">One link for all your transactions.</p>
                    </div>
                    <button
                        className="px-4 py-2 bg-dark-300 text-white-200 scale-[.60] rounded-md cursor-pointer "
                        onClick={(e) => toggleLinkVisi(e, "close")}
                    >
                        Close
                    </button>
                </div>
                <br />
                <div id="main" className="w-full h-[250px] flex flex-col items-center justify-center border-b border-b-grey">
                    <GiWallet className="p-3 text-[70px] text-dark-300 " />
                    <br />
                    <p className="text-dark-100 text-[25px] capitalize ">
                        {linkData?.title}
                    </p>
                    <br />
                    <p className="text-dark-100 font-extrabold text-[25px] ">
                        <span className="text-dark-400 text-[19px] ">{linkData?.currency}</span> {linkData?.amount}
                    </p>
                </div>
                <div id="details" className="w-full mt-1">
                    <div className="w-full flex flex-row items-start justify-center gap-1 flex-wrap">
                        <button className="px-6 py-3 bg-white-300 flex flex-row items-center justify-start gap-3 scale-[.75] rounded-[50px] text-dark-100 font-extrabold border-[1px] border-grey-100 transition-all hover:scale-[.80] hover:bg-dark-100 hover:text-white-100 " onClick={copyLink}>
                            <BiCopy className="text-[25px] " />
                            Copy
                        </button>

                        <button className="px-6 py-3 bg-white-300 flex flex-row items-center justify-start gap-3 scale-[.75] rounded-[50px] text-dark-100 font-extrabold border-[1px] border-grey-100 transition-all hover:scale-[.80] hover:bg-dark-100 hover:text-white-100 " onClick={deletePaymentLink}>
                            <BiTrash className="text-[25px] " />
                            {type === "delete" && loading ? "Deleing..." : "Delete"}
                        </button>

                        <button className="px-6 py-3 bg-white-300 flex flex-row items-center justify-start gap-3 scale-[.75] rounded-[50px] text-dark-100 font-extrabold border-[1px] border-grey-100 transition-all hover:scale-[.80] hover:bg-dark-100 hover:text-white-100 " onClick={toggleQrcode}>
                            <BiQrScan className="text-[25px] " />
                            QRCode
                        </button>

                        <button className="px-6 py-3 bg-red-200 flex flex-row items-center justify-start gap-3 scale-[.75] rounded-[50px] text-white-100 font-extrabold border-[1px] border-grey-100 transition-all hover:scale-[.80]" onClick={disablePaymentLink}>
                            {type === "disable" && loading ? "Disabling..." : "Disable"}
                        </button>
                    </div>
                    <br />
                    <br />
                    <p className="text-dark-100 text-[15px] font-extrabold text-center p-3 ">
                        Share the link to your customer and start accepting payment.
                    </p>
                </div>
            </div>
            {qrcodeActive && <QRCodeModal url={paymentLink} toggleQrcode={toggleQrcode} />}
        </div>
    )
}

function QRCodeModal({ url, toggleQrcode }) {


    const qrcodeComp = document.querySelector("#qrcode-comp")

    const downloadQRCode = () => {
        const img = qrcodeComp.querySelector("img")
        const link = document.createElement("a")
        link.href = img.src;
        link.download = "payment-qrcode"
        link.click()
        notif.success("Downloaded")
    }

    return (
        <div className="w-full h-screen bg-dark-400 absolute top-0 flex flex-col items-center justify-center">
            <div id="box" className="w-[350px] h-auto rounded-md bg-white-100 p-7 flex flex-col items-center justify-center ">
                <p className="text-dark-100 text-[20px] font-extrabold capitalize ">
                    QRCode
                </p>
                <p className="text-dark-400 text-[12px] font-semibold text-center capitalize ">
                    Download and Scan QRCode for onetime payment.
                </p>
                <br />
                <div id="qrcode-comp" className="w-full flex flex-col items-center justify-center p-2">
                    <QRCode value={url} width={500} margin={3} scale={5} />
                </div>
                <br />

                <div className="w-full flex flex-row items-center justify-center gap-5">
                    <button className="px-6 py-3 bg-dark-100 flex flex-row items-center justify-start gap-3 scale-[.75] rounded-[50px] text-white-100 font-extrabold border-[1px] border-grey-100 transition-all hover:scale-[.80] hover:bg-dark-100 hover:text-white-100 " onClick={downloadQRCode}>
                        <BiQrScan className="text-[25px] " />
                        Download
                    </button>

                    <button className="px-6 py-3 bg-red-200 flex flex-row items-center justify-start gap-3 scale-[.75] rounded-[50px] text-white-100 font-extrabold border-[1px] border-grey-100 transition-all hover:scale-[.80]" onClick={toggleQrcode}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}