import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export class Notification {
  constructor(duration = 3000) {
    this.duration = duration;
    if (typeof window !== "undefined") {
      this.notif = new Notyf({
        duration: this.duration,
        position: {
          x: "right",
          y: "top",
        },
      });
    }
  }

  error(message = "ERROR") {
    this.notif.error({
      message,
      dismissible: true,
    });
  }

  success(message = "SUCCESS") {
    return this.notif.success({
      message,
      dismissible: true,
    });
  }
}

export function validateEmail(email) {
  const tester =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;

  let emailParts = email.split("@");

  if (emailParts.length !== 2) return false;

  let account = emailParts[0];
  let address = emailParts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  let domainParts = address.split(".");
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  if (!tester.test(email)) return false;

  return true;
}

export const sleep = async (sec = 1) =>
  new Promise((res) => setTimeout(() => res(), sec * 1000));


const retriveDays = (day) => {
  switch (day) {
    case 1:
      return "Mon"
      break;

    case 2:
      return "Tue"
      break;
    case 3:
      return "Wed"
      break;
    case 4:
      return "Thur"
      break;
    case 5:
      return "Fri"
      break;
    case 6:
      return "Sat"
      break;
    case 7:
      return "Sun"
      break;
  }
}

export function formatDate(dateString) {
  const result = {
    month: "",
    day: "",
    date: "",
    year: "",
    time: "",
    fullDate: ""
  }

  const date = new Date(parseInt(dateString))

  if (isNaN(date.getDay())) return result;

  result.month = date.getMonth() + 1;
  result.day = retriveDays(date.getDay())
  result.date = date.getDate()
  result.year = date.getFullYear()
  result.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  result.fullDate = `${result.day} ${result.month} ${result.date}, ${result.year} ${result.time} `

  return result
}