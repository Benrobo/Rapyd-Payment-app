import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { Button, Input } from "../components/UI-COMP";
import API_ROUTES from "../config/apiRoutes";

import { Notification, sleep, validateEmail } from "../helpers/";
import Fetch from "../helpers/fetch";
import supportedCountries from "../data/supported_countries.json"
import all_countries from "../data/countries.json"
import DataContext from "../context/DataContext";


const notif = new Notification(6000);

function Authentication() {
  const { isAuthenticated } = useContext(DataContext)
  const [activeForm, setActiveForm] = useState("login");
  const [loading, setLoading] = useState(false);

  const toggleActiveForm = (form = "login") => setActiveForm(form);

  if (isAuthenticated) return window.location = "/dashboard"

  async function AuthenticateUser(
    type,
    payload = { email: "", username: "", password: "" }
  ) {
    if (type === "login") {
      const { email, password } = payload;

      if (email === "") return notif.error("email cant be empty");
      if (password === "") return notif.error("password cant be empty");
      if (!validateEmail(email)) return notif.error("Email given is invalid");

      try {
        // login user
        setLoading(true);
        const { res, data } = await Fetch(API_ROUTES.login, {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });

        setLoading(false);

        if (data && data?.success === false) {
          return notif.error(data?.message);
        }

        notif.success(data?.message);
        const result = data?.data;
        localStorage.setItem(
          "authToken",
          JSON.stringify({ accessToken: result?.accessToken })
        );
        localStorage.setItem("raypal", JSON.stringify(result));

        await sleep(2);
        window.location = "/dashboard";
      } catch (e) {
        setLoading(false);
        notif.error("Something went wrong during authentication. Try later")
      }
    }

    if (type === "signup") {
      const { email, username, password, country, currency } = payload;

      if (username === "") return notif.error("username cant be empty");
      if (email === "") return notif.error("email cant be empty");
      if (password === "") return notif.error("password cant be empty");
      if (country === "") return notif.error("country cant be empty");
      if (currency === "") return notif.error("currency cant be empty");
      if (!validateEmail(email)) return notif.error("Email given is invalid");

      try {
        // login user
        setLoading(true);
        const { res, data } = await Fetch(API_ROUTES.register, {
          method: "POST",
          body: JSON.stringify({
            username,
            email,
            password,
            country,
            currency
          }),
        });

        setLoading(false);

        if (data && data?.success === false) {
          return notif.error(data?.message);
        }

        notif.success(data?.message);
        toggleActiveForm("login");
        await sleep(1);
      } catch (e) {
        setLoading(false);
        notif.error("Something went wrong during authentication. Try later")
      }
    }
  }

  return (
    <div className="w-full h-screen">
      <div className="w-full h-screen flex flex-row items-start justify-center">
        <div id="left" className="w-full h-screen bg-dark-300 text-center flex flex-col items-center justify-center">
          <p className="text-white-100 font-sans text-[90px] font-extrabold ">
            RayPal
          </p>
          <p className="text-white-100 text-[15px] font-extrabold ">
            Receive, Send, Create Payment easily with a <span className="underline p-1 bg-white-100 text-dark-100 ">Twinkle of an eye</span> seamlessly.
          </p>
        </div>
        <div className="w-[90%] h-screen bg-white-300 flex flex-col items-center justify-center ">
          {activeForm === "login" ? (
            <LoginForm
              loading={loading}
              AuthenticateUser={AuthenticateUser}
              toggleActiveForm={toggleActiveForm}
            />
          ) : (
            <SignupForm
              loading={loading}
              AuthenticateUser={AuthenticateUser}
              toggleActiveForm={toggleActiveForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Authentication;

function LoginForm({ toggleActiveForm, AuthenticateUser, loading }) {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleInputs = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    // console.log({ name, value });
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-[400px] h-[400px] bg-white-100 mx-auto shadow-lg rounded-md">
      <div id="head" className="w-full h-[100px] border-b-[2px] border-b-grey p-6 ">
        <p className="text-dark-100 text-[20px] font-extrabold ">
          RayPal Account
        </p>
        <p className="text-dark-100 text-[12px] ">
          Login to your raypal account to continue using the app
        </p>
      </div>
      <div className="w-full p-6">
        <br />
        <Input
          placeholder="Email"
          type="email"
          name="email"
          onChange={handleInputs}
        />
        <br />
        <Input
          placeholder="Password"
          type="password"
          name="password"
          onChange={handleInputs}
        />
        <br />
        <br />
        <div className="w-full flex flex-row items-center justify-between gap-5">
          <Button
            type="secondary"
            loading={loading}
            text={`${loading ? "Logging In" : "Login"}`}
            long={true}
            style={{ padding: "10px" }}
            onClick={() => AuthenticateUser("login", inputs)}
          />
        </div>
        <br />
        <small className="text-dark-100 font-extrabold">
          Dont have an account ?{" "}
          <a
            className="text-dark-100 underline cursor-pointer"
            onClick={() => toggleActiveForm("signup")}
          >
            Create one
          </a>
        </small>
      </div>
    </div>
  );
}

function SignupForm({ toggleActiveForm, AuthenticateUser, loading }) {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    currency: "",
  });
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCountryData, setSelectedCountryData] = useState([])

  useEffect(() => {
    let obj = {}
    for (const key in supportedCountries) {
      for (const key2 in all_countries) {
        obj[all_countries[key]] = key;
      }
    }
    setCountries(Object.entries(obj))
  }, [])

  const handleInputs = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    // console.log({ name, value });
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (name === "country") {
      setSelectedCountryData([])
      setSelectedCountry(value)
    }
  };


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
    <div className="w-[450px] h-[530px] bg-white-100 mx-auto shadow-lg rounded-md ">
      <div id="head" className="w-full h-[100px] border-b-[2px] border-b-grey p-6 ">
        <p className="text-dark-100 text-[20px] font-extrabold ">
          RayPal Account
        </p>
        <p className="text-dark-100 text-[12px] ">
          Create your first raypal account and start receiving payments seamlessly.
        </p>
      </div>
      <div className="w-full p-6">
        <br />
        <Input
          type="text"
          name="username"
          onChange={handleInputs}
          placeholder="Full Name"
        />
        <br />
        <Input
          type="email"
          name="email"
          onChange={handleInputs}
          placeholder="Email"
        />
        <br />
        <Input
          type="password"
          name="password"
          onChange={handleInputs}
          placeholder="Password"
        />
        <br />
        <br />
        <div className="w-full flex flex-row items-center justify-between gap-5">
          <div className="w-auto h-auto flex flex-col items-start justify-start border-b-[1px] border-b-grey-100 ">
            <label className="text-dark-100 font-extrabold text-[15px] ">Countries</label>
            <select className="w-full h-auto px-3 py-2 mt-2 rounded-md bg-dark-200 text-white-100" name="country" onChange={handleInputs}>
              <option value="">Countries</option>
              {countries.map((list, i) => (
                <option key={i} value={list[1]} className="">
                  {list[0]}: {list[1]}
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
        <br />
        <div className="w-full flex flex-row items-center justify-between gap-5">
          <Button
            type="secondary"
            loading={loading}
            text={`${loading ? "Creating Account..." : "Create Account"}`}
            long={true}
            style={{ padding: "10px" }}
            onClick={() => AuthenticateUser("signup", inputs)}
          />
        </div>
        <br />
        <small className="text-dark-100 font-extrabold">
          Have an account ?{" "}
          <a
            className="text-dark-100 underline cursor-pointer"
            onClick={() => toggleActiveForm("login")}
          >
            Log In
          </a>
        </small>
        <br />
      </div>
    </div>
  );
}
