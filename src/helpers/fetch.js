import jwtDecode from "jwt-decode";
import { BASE_URL } from "../config";

const refreshToken = async (accessToken) => {
  if (accessToken !== undefined || accessToken !== "") {
    try {
      let url = `${BASE_URL}/auth/refresh`;
      let res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token: accessToken }),
      });

      let data = await res.json();

      if (data && data.error === true) {
        throw new Error(data.message);
      }

      const { token } = data;
      localStorage.setItem("authToken", JSON.stringify({ accessToken: token }));
      return token;
    } catch (err) {
      throw new Error(err.message);
    }
  }
};

async function fetchData(url, config = {}) { }

async function Fetch(url, config = {}) {
  const tokenData =
    localStorage.getItem("authToken") === null
      ? null
      : JSON.parse(localStorage.getItem("authToken"));
  let token = tokenData === null ? null : tokenData?.accessToken;

  if (token) {
    // exp gives us date in milliseconds
    let { exp } = jwtDecode(token);
    // convert milliseconds -> seconds
    let date = new Date().getTime() / 1000;
    // check if exp date is < the present date
    if (exp < date) {
      // console.log("TOKEN AVAILABLE", token);
      // let authToken = await refreshToken(token)
      // token = authToken
    }
  }
  // add headers begfore making requests
  config["headers"] = {
    "content-type": "application/json",
    "Authorization": `Bearer ${token}`,
    "mode": 'same-origin',
    "redirect": 'follow',
    "credentials": 'include',
  };

  let res = await fetch(url, config);
  let data = await res.json();

  return { res, data };
}

export default Fetch;
