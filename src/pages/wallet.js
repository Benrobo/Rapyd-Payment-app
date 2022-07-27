import React, { useState, useEffect } from "react";
import { Layout, Loader } from "../components";
import {
  Button,
  Input,
  StatusState,
  SelectInput,
} from "../components/UI-COMP";
import { GoVerified } from "react-icons/go"
import { BsArrowBarDown, BsShieldFillCheck, BsFillInfoCircleFill, BsArrowDownUp } from "react-icons/bs"
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
import { formatDate, Notification, sleep } from "../helpers"
import Fetch from "../helpers/fetch"
import API_ROUTES from "../config/apiRoutes"

import suppCountries2 from "../data/supp_countries.json"
import countryCodes from "../data/country_codes.json"
import countries from "../data/supported_countries.json"

const notif = new Notification(10000)

const genId = (count = 6) => {
  const alph = "1234567890".split("")
  let id = "";
  Array(count + 1).fill().forEach((arr, i) => {
    let rand = Math.floor(Math.random() * alph.length)
    id += alph[rand]
  })
  console.log(id);
  return id;
}

const userInfo = localStorage.getItem("raypal") === null ? null : JSON.parse(localStorage.getItem("raypal"))


function Wallets() {
  const [isCreateWallet, setIsCreateWallet] = useState(false);
  const [activeWalletData, setActiveWalletData] = useState(false);

  const toggleIsCreateWallet = () => setIsCreateWallet(!isCreateWallet);
  const toggleactiveWalletData = () => setActiveWalletData(!activeWalletData);
  const [selectedTran, setSelectedTran] = useState({})
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)
  const [totalPaidTran, setTotalPaidTran] = useState(0)
  const [isTranOpen, setIsTranOpen] = useState(false)
  // withdraw fund modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  const openTran = (e) => {
    const dataset = e.target.dataset;
    if (Object.entries(dataset).length > 0) {
      const { id } = dataset;
      const filteredTran = transactions.filter((tran) => tran._id === id)[0]
      setSelectedTran(filteredTran)
    }
    setIsTranOpen(true)
  }

  const closeTran = () => setIsTranOpen(false)

  const toggleWithdrawFundMOdal = () => setIsWithdrawOpen(!isWithdrawOpen)

  useEffect(() => {
    getTransactions()

    if (transactions.length > 0) {
      calculateTotalTransactions()
    }
  }, [transactions.length, setTransactions])


  const calculateTotalTransactions = () => {
    const filteredTran = transactions.map((tran) => parseInt(tran.paid)).reduce((total, acc) => { return total += acc }, 0)
    setTotalPaidTran(filteredTran)
  }

  async function getTransactions() {
    try {
      setLoading(true)
      const { res, data } = await Fetch(API_ROUTES.getWalletTransactions, {
        method: "POST"
      })
      setLoading(false)

      if (data && data.success === false) {
        return setError(data.message)
      }

      setTransactions(data.data)
    } catch (e) {
      setLoading(false)
      setError(e.message)
    }

  }

  return (
    <Layout sideBarActiveName="wallets">
      <div className="relative  flex flex-col items-start justify-start w-full h-screen">
        <br />
        <WalletInformations transactionData={{ loading, error, transactions, totalPaidTran }} openTran={openTran} toggleactiveWalletData={toggleactiveWalletData} toggleWithdrawFund={toggleWithdrawFundMOdal} />

        {isTranOpen && <ViewTransaction isTranOpen={isTranOpen} data={selectedTran} closeTran={closeTran} />}

        {isWithdrawOpen && <WithDrawFund balance={totalPaidTran} toggleModal={toggleWithdrawFundMOdal} />}
      </div>
    </Layout>
  );
}

export default Wallets;

function WithDrawFund({ balance, toggleModal }) {

  const wId = localStorage.getItem("walletId") === null ? "" : JSON.parse(localStorage.getItem("walletId")).id
  // const wInfo = localStorage.getItem("walletInfo") === null ? "" : JSON.parse(localStorage.getItem("walletInfo"))
  const [amount, setAmount] = useState(0)
  const [data, setData] = useState(null)
  const [loader, setLoader] = useState({
    walletInfo: false,
    withdraw: false
  })
  const [selectedAcct, setSelectedAcct] = useState({
    currency: "",
    country: "",
    balance: 0
  })


  async function getWalletsInformation() {

    try {
      setLoader((prev) => ({ ...prev, ["walletInfo"]: true }))
      const url = `${API_ROUTES.getWalletInfo}/${userInfo?.id}`
      const { res, data } = await Fetch(url, {
        method: "POST"
      })
      setLoader((prev) => ({ ...prev, ["walletInfo"]: false }))

      if (data && data.success === false) {
        return notif.error(data.message)
      }

      setData(data?.data)
    } catch (e) {
      setLoader((prev) => ({ ...prev, ["walletInfo"]: false }))
      notif.error(e.message)
    }

  }

  useEffect(() => {
    getWalletsInformation()
  }, [])

  async function withdrawFund() {
    const { currency, country } = selectedAcct;
    if (amount === "") return notif.error("amount cant be empty")
    // if (amount > balance) return notif.error("insufficient funds.")
    if (amount === 0) return notif.error("can only withdraw fund > 0.")

    const body = {
      amount,
      country,
      currency
    }

    try {
      setLoader((prev) => ({ ...prev, ["withdraw"]: true }))
      const url = API_ROUTES.withdraw
      const { res, data } = await Fetch(url, {
        method: "POST",
        body: JSON.stringify(body)
      })
      setLoader((prev) => ({ ...prev, ["withdraw"]: false }))

      if (data && data.success === false) {
        return notif.error(data.message)
      }

      notif.success(data.message)
      toggleModal()
    } catch (e) {
      console.log(e);
      setLoader((prev) => ({ ...prev, ["withdraw"]: false }))
      notif.error(e.message)
    }

  }

  const handleSelectedAcct = (e) => {
    let value = e.target.value;
    data?.accounts.map((acct) => {
      if (acct.currency === value) {
        suppCountries2.supported_countries.map((data) => {
          if (data.currencies.includes(value)) {
            setSelectedAcct((prev) => ({ ...prev, ["country"]: data.country, ["currency"]: value, ["balance"]: acct.balance }))
          }
        })
      }
    })
  }

  return (
    <div className="w-full h-screen bg-dark-400 absolute top-0 flex flex-col items-center justify-center">
      <div id="box" className="w-[350px] h-auto rounded-md bg-white-100 p-7 flex flex-col items-center justify-center ">
        <p className="text-dark-100 text-[20px] font-extrabold capitalize ">
          Withdraw Fund
        </p>
        <p className="text-dark-400 text-[12px] font-semibold text-center capitalize ">
          Withdraw funds from your personal wallet.
        </p>
        <br />
        <p className="text-dark-100 font-extrabold text-[15px] text-center capitalize ">
          <span className="text-white-400 text-[12px] ">Curr Balance: </span> {selectedAcct.balance}
        </p>
        <br />
        <div id="form" className="w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-start justify-start">
            <label className="text-dark-100 text-[12px] ">E-wallet ID</label>
            <Input disabled={true} value={wId} style={{ opacity: ".9" }} />
          </div>
          <br />
          <div className="w-full flex flex-row items-center justify-between gap-4">
            <div className="w-full flex flex-col items-start justify-start">
              <label className="text-dark-100 text-[12px] ">Amount</label>
              <Input name="amount" type='number' min={0} onChange={(e) => setAmount(e.target.value)} placeHolder="50" value={amount} />
            </div>
            <div className="w-full flex flex-col items-start justify-start">
              <label className="text-dark-100 text-[12px] ">Currency</label>
              <select className="w-full h-auto px-3 py-2 mt-1 rounded-md bg-dark-200 text-white-100" onChange={handleSelectedAcct}>
                <option value="">Currencies Balance</option>
                {
                  loader.walletInfo ?
                    <option value="">Loading</option>
                    :
                    data === null || data?.accounts.length === 0 ?
                      <option value=""></option>
                      :
                      data?.accounts.map((list, i) => (
                        <option key={i} value={list.currency} className="capitalize">
                          {list.currency}
                        </option>
                      ))
                }
              </select>
            </div>
          </div>
        </div>
        <br />
        <div className="w-full h-auto flex flex-row items-center justify-between">
          <Button text="Close" type='danger' onClick={toggleModal} />
          <Button loading={loader.withdraw} text={loader.withdraw ? "Withdrawing..." : "Withdraw"} type='secondary' onClick={withdrawFund} />
        </div>
      </div>
    </div>
  )
}


function WalletInformations({ toggleactiveWalletData, toggleWithdrawFund, transactionData, openTran }) {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState([])
  const [isCopied, setIsCopied] = useState(false)

  const [updateFormVisi, setUpdateFormVisi] = useState(false)

  const toggleUpdateForm = () => {
    setUpdateFormVisi(!updateFormVisi)
  }

  async function getWalletsInformation() {

    try {
      setLoading(true)
      const url = `${API_ROUTES.getWalletInfo}/${userInfo?.id}`
      const { res, data } = await Fetch(url, {
        method: "POST"
      })
      setLoading(false)

      if (data && data.success === false) {
        console.log(data.message)
        return setError(data.message)
      }

      setWalletInfo([data?.data])
      localStorage.setItem("wallet-status", JSON.stringify({ verified: data?.data.verification_status }))
      localStorage.setItem("walletId", JSON.stringify({ id: data?.data.id }))
      localStorage.setItem("walletInfo", JSON.stringify({ country: data?.data.country, currency: data?.data.currency }))
    } catch (e) {
      setLoading(false)
      setError(e.message)
    }

  }

  useEffect(() => {
    getWalletsInformation()
  }, [])

  // 
  if (isCopied) {
    setTimeout(() => setIsCopied(false), 2000)
  }

  const copyWalletId = () => {
    const id = walletInfo[0]?.id;
    navigator.clipboard.writeText(id)
    notif.success("Copied")
    setIsCopied(true)
  }

  return (
    <div className="w-full h-screen overflow-y-scroll bg-white-100">
      <div id="head" className="w-full h-auto">
        <br />
        {
          loading ?
            <Loader text="Loading Wallet Details" type="loading" />
            :
            error !== null ?
              <Loader text={error} type="error" />
              :
              walletInfo.length === 0 ?
                <Loader text={"No wallet available"} type="error" />
                :
                walletInfo.map((data, i) => (
                  <div className="w-full flex flex-row pb-5 items-center justify-between px-5 mt-3 border-b border-gray-550" key={i}>
                    <div className="w">
                      <p className="text-dark-100 font-extrabold text-[20px] flex flex-row items-center justify-start ">
                        {data?.ewallet_reference_id}
                        {data?.verification_status === "verified" && <GoVerified className={` ml-3 text-[23px] p-1 text-blue-400`} />}
                      </p>
                      <div className="w-auto flex flex-row items-center justify-start">
                        <small className={`${data?.verification_status === "verified" ? "text-dark-100" : "text-red-200"} text-[12px] font-extrabold`}>
                          <b>{data?.verification_status}</b>
                        </small>
                        <span className="text-dark-400 ml-1"> | </span>
                        <span className="ml-1 text-dark-200 font-extrabold text-[12px] ">
                          <span className="text-white-400 text-[10px] ">type :</span> {data?.type}
                        </span>
                        <span className="text-dark-400 ml-1"> | </span>
                        <span className="ml-1 text-dark-200 font-extrabold text-[12px] ">
                          <span className="text-white-400 text-[10px] ">country :</span> {data?.country}
                        </span>
                        <span className="text-dark-400 ml-1"> | </span>
                        <span className="ml-1 text-dark-200 font-extrabold text-[12px] ">
                          <span className="text-white-400 text-[10px] ">currency :</span> {data?.currency}
                        </span>
                        <span className="text-dark-400 ml-1"> | </span>
                        <span className="ml-1 text-dark-200 font-extrabold text-[12px] ">
                          <span className="text-white-400 text-[10px] ">ref :</span> {data?.ewallet_reference_id}
                        </span>
                      </div>
                      <br />
                      <div className="action w-auto flex flex-row items-center justify-start gap-1">
                        <small className="text-dark-100 font-bold">
                          {data?.id.slice(0, 20) + "...."}
                        </small>
                        <button className="px-4 py-2 bg-dark-300 text-white-200 scale-[.65] rounded-md cursor-pointer " onClick={copyWalletId}>
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                        <button className="px-4 py-3 bg-dark-300 text-white-200 scale-[.65] rounded-md cursor-pointer " onClick={toggleUpdateForm}>
                          Verify & Update Wallet
                        </button>
                      </div>
                    </div>
                    <br />
                    <div className="action flex flex-row justify-between items-center">
                      <button className="px-4 py-3 bg-dark-100 text-white-100 scale-[.70] rounded-md cursor-pointer " onClick={toggleWithdrawFund}>
                        Withdraw Fund
                      </button>
                      <button className="px-4 py-3 bg-dark-200 text-white-100 scale-[.70] rounded-md cursor-not-allowed ">
                        Transfer
                      </button>
                    </div>
                  </div>
                ))

        }
        <br />
      </div>
      <br />
      <div className="w-full h-screenn">
        {
          !loading && <WalletTransactions walletData={walletInfo} transactionData={transactionData} openTran={openTran} />
        }
        <div className="w-full h-[200px] "></div>
      </div>
      {updateFormVisi && <UpdateWalletInfoForm toggleUpdateForm={toggleUpdateForm} />}
    </div>
  );
}


function UpdateWalletInfoForm({ toggleUpdateForm }) {

  const [steps, setSteps] = useState(1)
  const [idTypeRequirement, setIdTypeRequirement] = useState({

  })
  const [inputs, setInputs] = useState({
    walletType: "",
    walletName: "",
    countryCode: "",
    phonenumber: "",
    country: "",
    nationality: ""
  })
  const [verifyData, setVerifyData] = useState({
    idType: "",
    country: "",
    backId: "",
    frontId: "",
    faceId: "",
  })
  const [conCodes, setConCodes] = useState([])
  const [country, setCountry] = useState([])
  const [idTypes, setIdTypes] = useState([])
  const [idLoading, setIdLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const nextStep = (step) => setSteps((prev) => (prev = step))
  const [defaultIdParams, setDefaultIdParams] = useState({
    front: true,
    face: false,
    back: false
  })

  useEffect(() => {
    if (verifyData.idType !== "") {
      const filter = idTypes.filter((id) => id.type === verifyData.idType)[0];

      setDefaultIdParams((prev) => ({
        ...prev,
        back: filter.is_back_required,
        face: true
      }))
    }
  }, [verifyData.idType])
  // const prevStep = () => setSteps((prev) => (prev <= 1 ? prev = 1 : prev -= 1))

  const handleInputs = (e) => {
    const name = e.target.name;
    const val = e.target.value;
    setInputs((prev) => ({ ...prev, [name]: val }))
    if (name === "verifyCountry") {
      setVerifyData((prev) => ({ ...prev, ["country"]: val }))
    }
    if (name === "idType") {
      setVerifyData((prev) => ({ ...prev, ["idType"]: val }))
    }
  }

  useEffect(() => {
    let store1 = []
    let store2 = []
    // traverse countrys and country codes
    for (const key in countries) {
      if (Object.hasOwnProperty.call(countries, key)) {
        const val = countries[key]
        store1.push({ [key]: val })
      }
    }

    for (const name in countryCodes) {
      if (Object.hasOwnProperty.call(countryCodes, name)) {
        const val = countryCodes[name]
        store2.push({ [name]: val })
      }
    }
    setCountry(store1)
    setConCodes(store2)
  }, [])

  useEffect(() => {
    fetchIdTypes()
  }, [verifyData.country])


  // fetch id type
  async function fetchIdTypes() {
    const { country } = verifyData
    if (country !== "") {

      try {
        setIdLoading(true)
        const url = `${API_ROUTES.getIdentityTypes}/${country}`
        const { res, data } = await Fetch(url, {
          method: "GET",
        })
        setIdLoading(false)

        if (data && data.success === false) {
          console.log(data);
          return notif.error(data.message)
        }

        // console.log(data);
        setIdTypes(data.data)
      } catch (e) {
        console.log(e);
        notif.error(e.mesage)
      }
    }

  }

  // convert image to base64
  const getBase64StringFromDataURL = (dataURL) => dataURL.replace('data:', '').replace(/^.+,/, '');

  function handleImageUpload(e) {
    const name = e.target.name
    const validType = ["jpg", "png", "jpeg", "JPG", "JPEG", "PNG"]
    const file = e.target.files[0]
    let type = file?.type.split("/")[1]

    if (!validType.includes(type)) {
      return notif.error("Invalid file type uploaded")
    }
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      const base64 = getBase64StringFromDataURL(reader.result)
      setVerifyData((preVal) => ({ ...preVal, [name]: base64 }))
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }
  // verify Wallet
  async function verifyWalletIdentity() {
    const { idType, country, backId, frontId, faceId } = verifyData;

    try {
      const walletData = {
        back_side_image: backId,
        country,
        document_type: idType,
        face_image: faceId,
        front_side_image: frontId,
        reference_id: `${genId(6)}success`,
      };
      setVerifyLoading(true);
      const { res, data } = await Fetch(API_ROUTES.verifyWalletIdentity, {
        method: "POST",
        body: JSON.stringify(walletData)
      })
      setVerifyLoading(false);

      if (data && data.success === false) {
        console.log(data);
        return notif.error(data.message)
      }

      notif.success(data.message)
      localStorage.setItem("wallet-status", JSON.stringify({ verified: "verified" }))
      window.location.reload(true)
      return
    } catch (e) {
      console.log(e);
      return notif.error(e.message)
    }
  }

  async function updateWalletInfo() {

    const { walletType, walletName, countryCode, phonenumber, country, nationality } = inputs;
    if (walletType === "") return notif.error("wallet Type cant be empty")
    if (walletName === "") return notif.error("wallet name cant be empty")
    if (countryCode === "") return notif.error("wallet country code cant be empty")
    if (phonenumber === "") return notif.error("phonenumber cant be empty")
    if (country === "") return notif.error("country cant be empty")
    if (nationality === "") return notif.error("nationality cant be empty")

    const newPhoneNumber = `${countryCode}${phonenumber.slice(1)}`

    const walletInfo = {
      phone_number: newPhoneNumber,
      type: walletType,
      wallet_name: walletName,
      country,
      nationality
    }

    console.log(walletInfo)
  }

  return (
    <div className="w-screen h-screen bg-dark-400 flex flex-col items-center justify-center fixed top-0 left-0">
      <div id="box" className="w-[400px] bg-white-100 h-auto rounded-md">

        {
          steps === 1 ?
            <div id="options" className="w-full flex flex-col items-center justify-center">
              <div id="head" className="w-full h-auto flex flex-row items-center justify-between px-4 py-2">
                <p className="text-dark-100 font-extrabold text-[15px] ">Wallet Options.</p>
                <button
                  className="px-4 py-2 bg-dark-300 text-white-200 scale-[.60] rounded-md cursor-pointer "
                  onClick={toggleUpdateForm}
                >
                  Close
                </button>
              </div>
              <div className="w-full cursor-pointer flex px-5 py-4 flex-row items-center justify-start border-b-[2px] border-t-[2px] border-grey-100" onClick={() => nextStep(2)}>
                <BsShieldFillCheck className=" mr-3 p-4 bg-dark-100 rounded-[50%] text-[60px] text-white-100 " />
                <div className="w-auto flex flex-col items-start justify-start">
                  <p className="text-dark-100 text-[20px] font-extrabold ">Verify Your Wallet.</p>
                  <p className="text-dark-100 text-[15px] ">Verify your wallet to continue.</p>
                </div>
                <IoIosArrowForward className="p-1 text-[60px] text-white-400 " />
              </div>
              <div className="w-full cursor-not-allowed flex px-5 py-4 flex-row items-center justify-start opacity-[.3] " disabled onClick={"() => nextStep(3)"}>
                <BsFillInfoCircleFill className="mr-3 p-4 bg-dark-100 rounded-[50%] text-[60px] text-white-100 " />
                <div className="w-auto flex flex-col items-start justify-start">
                  <p className="text-dark-100 text-[20px] font-extrabold ">Update Wallet.</p>
                  <p className="text-dark-100 text-[15px] ">Update your wallet informations.</p>
                </div>
                <IoIosArrowForward className=" p-1 text-[60px] text-white-400 " />
              </div>
            </div>
            :
            steps === 2 ?
              <div id="step2" className="w-full h-auto">
                <div id="head" className="w-full p-3 flex flex-row items-start justify-start border-b-[1px] border-b-grey-100 ">
                  <p className="text-dark-100 font-extrabold text-[20px] ">Verify Wallet</p>
                </div>
                <div className="w-full flex flex-col items-center justify-center p-3">
                  <div id="flex" className="w-full flex flex-row items-center justify-between gap-2">
                    <select className="w-full h-auto px-3 py-3 mt-2 rounded-md bg-dark-200 text-white-100" name="verifyCountry" onChange={handleInputs}>
                      <option value="">Country</option>
                      {country.map((list, i) => (
                        <option key={i} value={Object.keys(list)[0]} className="capitalize">
                          {` ${Object.keys(list)[0]} `}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select className="w-full h-auto px-3 py-3 mt-2 rounded-md bg-dark-200 text-white-100" name="idType" onChange={handleInputs} disabled={idTypes.length === 0 || idLoading ? true : false}>
                    <option value="">{idLoading ? "Loading..." : "Identity Types"}</option>
                    {idTypes.map((list, i) => (
                      <option key={i} value={list.type} className="capitalize">
                        {list.name}
                      </option>
                    ))}
                  </select>
                  <br />
                  <div className={`w-full flex flex-row items-center justify-between gap-3 ${verifyData.idType === "" || idLoading ? "opacity-[.2]" : "opacity-[1]"} `}>
                    {defaultIdParams.front && <div className="w-auto flex flex-col items-start justify-start">
                      <label className="text-dark-100 text-[12px] font-extrabold">Front Identity Image</label>
                      <Input onChange={handleImageUpload} id="file1" type="file" name="frontId" />
                    </div>}
                    {defaultIdParams.back && <div className="w-auto flex flex-col items-start justify-start">
                      <label className="text-dark-100 text-[12px] font-extrabold">Back Identity Image</label>
                      <Input onChange={handleImageUpload} id="file2" type="file" name="backId" />
                    </div>}
                  </div>
                  <div className={`w-full flex flex-row items-center justify-between gap-3 ${verifyData.idType === "" || idLoading ? "opacity-[.2]" : "opacity-[1]"} `}>
                    {defaultIdParams.face && <div className="w-auto flex flex-col items-start justify-start">
                      <label className="text-dark-100 text-[12px] font-extrabold">Face Image</label>
                      <Input onChange={handleImageUpload} id="file1" type="file" name="faceId" />
                    </div>}
                  </div>
                  <br />
                  <div id="flex" className="w-full flex flex-row items-center justify-between gap-2">
                    <Button type="danger" text="Close" onClick={toggleUpdateForm} />
                    <Button type="secondary" loading={verifyLoading} text={verifyLoading ? "Verifying..." : "Verify Wallet"} onClick={verifyWalletIdentity} />
                  </div>
                </div>
              </div>
              :
              steps === 3 ?
                <div id="step1" className="w-full h-auto">
                  <div id="head" className="w-full p-3 flex flex-row items-start justify-start border-b-[1px] border-b-grey-100 ">
                    <p className="text-dark-100 font-extrabold text-[20px] ">Update Wallet</p>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center p-3">
                    <SelectInput data={["person", "company"]} title={"Wallet Type"} name="walletType" onChange={handleInputs} />
                    <Input placeHolder="Wallet Name" name="walletName" onChange={handleInputs} />
                    <div id="flex" className="w-full flex flex-row items-center justify-between gap-2">
                      <select className="w-full h-auto px-3 py-3 mt-2 rounded-md bg-dark-200 text-white-100" name="countryCode" onChange={handleInputs}>
                        <option value="">Country Codes</option>
                        {conCodes.map((list, i) => (
                          <option key={i} value={Object.values(list)[0]} className="capitalize">
                            {` ${Object.keys(list)[0]}: ${Object.values(list)[0]} `}
                          </option>
                        ))}
                      </select>
                      <Input placeHolder="Phonenumber" type="number" name="phonenumber" onChange={handleInputs} />
                    </div>
                    <div id="flex" className="w-full flex flex-row items-center justify-between gap-2">
                      <select className="w-full h-auto px-3 py-3 mt-2 rounded-md bg-dark-200 text-white-100" name="country" onChange={handleInputs}>
                        <option value="">Country</option>
                        {country.map((list, i) => (
                          <option key={i} value={Object.keys(list)[0]} className="capitalize">
                            {` ${Object.keys(list)[0]}: ${Object.values(list)[0]} `}
                          </option>
                        ))}
                      </select>

                      <select className="w-full h-auto px-3 py-3 mt-2 rounded-md bg-dark-200 text-white-100" name="nationality" onChange={handleInputs}>
                        <option value="">Nationality</option>
                        {country.map((list, i) => (
                          <option key={i} value={Object.keys(list)[0]} className="capitalize">
                            {` ${Object.keys(list)[0]}: ${Object.values(list)[0]} `}
                          </option>
                        ))}
                      </select>
                    </div>
                    <br />
                    <div id="flex" className="w-full flex flex-row items-center justify-between gap-2">
                      <Button type="danger" text="Close" onClick={toggleUpdateForm} />
                      <Button type="secondary" text={`Update Wallet`} onClick={updateWalletInfo} />
                    </div>
                  </div>
                </div>
                :
                ""
        }


      </div>
    </div>
  )
}


function WalletTransactions({ openTran, walletData, transactionData }) {

  console.log(transactionData)


  return (
    <>
      <div class="flex flex-row justify-between pb-5 px-5 mt-5 border-b border-gray-550">
        <div>
          <div class="font-semibold text-sm3 text-gray-650">
            <span class="text-md">{walletData[0]?.currency}</span> <span class="text-[25px]">{transactionData?.totalPaidTran < 10 ? transactionData?.totalPaidTran + ".00" : transactionData?.totalPaidTran}</span>
          </div>
          <div class="text-gray-600 font-bold lg:mt-2 text-med">
            Total Paid Transaction
          </div>
        </div>
        <div>
          <div class="font-semibold text-sm3 flex flex-row items-center justify-start text-gray-650 gap-5">
            <BsArrowDownUp className="text-dark-100 font-extrabold font-sans text-[25px] " /> <span class="text-[25px] font-extrabold">{transactionData?.transactions.length}</span>
          </div>
          <div class="text-gray-600 font-bold lg:mt-2 text-med">
            Total Transactions
          </div>
        </div>
        {/* <div class="mt-3 lg:mt-0">
          <div class="font-semibold text-sm3 text-gray-650">DATE CREATED</div>
          <div class="text-gray-600 font-bold lg:mt-2 text-med">
            8:25:43 AM, June 21, 2022
          </div>
        </div> */}
      </div>
      <div className="p-5 w-full h-screen overflow-y-scroll">
        {
          transactionData.loading ?
            <Loader type="loading" text="loading transactions" />
            :
            transactionData.error !== null ?
              <Loader type="message" text={transactionData.error} />
              :
              transactionData.transactions.length === 0 ?
                <Loader type="message" text={"No Transactions Avaialable."} />
                :

                <table className="w-full table table-auto ">
                  <thead className="w-full bg-dark-300">
                    <tr className="">
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        TYPE
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        DATE
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        CURRENCY
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        AMOUNT
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        DEPOSITED
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        Status
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        Info
                      </th>
                      <th className="text-white-100 px-4 py-3 text-left th font-extrabold ">
                        Refund Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="w-full text-start">
                    {
                      transactionData.transactions.map((data) => (
                        <tr className="bg-white-300" key={data._id}>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            Cash
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            {formatDate(data.createdAt).fullDate}
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            <p className="text-dark-100 font-extrabold">{data.currency}</p>
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            <p className="text-dark-100 font-extrabold">{data.totalAmount}</p>
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            <p className="text-dark-100 font-extrabold">{data.paid}</p>
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            <StatusState state={data.status === "Created" ? "pending" : "approved"} text={data.status === "Created" ? "Created" : "Completed"} />
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            <button
                              className="px-4 py-2 bg-dark-300 text-white-200 scale-[.70] rounded-md cursor-pointer "
                              onClick={openTran}
                              data-id={data._id}
                            >
                              View
                            </button>
                          </td>
                          <td className="text-dark-300 px-4 text-sm py-3 td-left font-bold">
                            <StatusState state={parseInt(data.paid) > parseInt(data.totalAmount) ? "rejected" : "approved"} text={parseInt(data.paid) > parseInt(data.totalAmount) ? "Urgent" : "None"} />
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
        }
        <div className="w-full h-[150px] "></div>
      </div>
    </>
  )
}


function ViewTransaction({ isTranOpen, closeTran, data }) {

  const [open, setOpen] = useState(false)

  const closeTranModal = () => {
    setOpen(false)
    closeTran()
  }

  useEffect(() => {
    if (isTranOpen) {
      setOpen(true)
    }
  }, [])

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center fixed top-0 left-0 bg-dark-400 ">

      <div id="card" className={`w-[450px] ${open ? "h-[95%]" : "h-0"} transition-all absolute bottom-0 bg-white-100 overflow-hidden `}>
        <div id="head" className="w-full flex flex-row items-center justify-between bg-grey-100 border-b-[1px] border-b-grey p-2 ">
          <div className="w-auto flex flex-col items-start justify-start">
            <p className="text-dark-100 font-extrabold text-[15px] ">Transaction</p>
            <p className="text-dark-400 font-bold text-[12px] ">RayPal Transaction</p>
          </div>
          <button
            className="px-4 py-2 bg-dark-300 text-white-200 scale-[.60] rounded-md cursor-pointer "
            onClick={closeTranModal}
          >
            Close
          </button>
        </div>
        <br />
        <div id="main" className="w-full h-[250px] flex flex-col items-center justify-center border-b border-b-grey">
          <BsArrowBarDown className="p-3 text-[70px] rounded-[100%] border-[1px] border-grey-100 text-dark-300 " />
          <p className="text-dark-100 font-extrabold text-[25px] text-center ">
            <span className="text-white-400 text-[15px] "> Total Amount: </span>
            <br />
            {data.totalAmount}
          </p>
          <br />
          <p className="text-dark-100 font-extrabold text-[25px] text-center ">
            <span className="text-white-400 text-[15px] ">Amount Paid: </span>
            <br />
            <span className="text-dark-400 text-[15px] ">{data.currency}</span> {parseInt(data.paid) < 10 ? data.paid + ".00" : data.paid}
          </p>
        </div>
        <div id="details" className="w-full">
          <div className="w-full flex flex-row items-center justify-center p-3 border-b-[1px] border-grey-100">
            <p className="text-dark-100 font-extrabold text-[15px] ">Sender Details</p>
          </div>
          <table className="table w-full">
            <tr className="w-full flex items-center justify-between p-3 ">
              <td>
                <p className="text-dark-100 font-extrabold text-[13px] ">Status</p>
              </td>
              <td>
                <p className="text-dark-100 text-[15px] font-bold">
                  <StatusState state={data.status === "Created" ? "pending" : "approved"} text={data.status === "Created" ? "Created" : "Completed"} />
                </p>
              </td>
            </tr>
            <tr className="w-full flex items-center justify-between p-3 ">
              <td>
                <p className="text-dark-100 font-extrabold text-[13px] ">Email</p>
              </td>
              <td>
                <p className="text-dark-100 text-[15px] font-bold">{data.email || "N/A"}</p>
              </td>
            </tr>
            <tr className="w-full flex items-center justify-between p-3 ">
              <td>
                <p className="text-dark-100 font-extrabold text-[13px] ">Info</p>
              </td>
              <td>
                <p className="text-dark-100 text-[15px] font-bold capitalize ">
                  {data.name || "N/A"}
                </p>
              </td>
            </tr>
            <tr className="w-full flex items-center justify-between p-3 ">
              <td>
                <p className="text-dark-100 font-extrabold text-[13px] ">Date</p>
              </td>
              <td>
                <p className="text-dark-100 text-[15px] font-bold ">{formatDate(data.createdAt).fullDate}</p>
              </td>
            </tr>
            <tr>
            </tr>
          </table>
        </div>
      </div>
    </div>
  )
}