import Fetch from "./fetch"

async function convertCurrency(from, to, amount) {
    // const httpURLPath = `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amount}`;
    // const apiKey = "d634d0f003634016b06f6a739bdf0156"
    // const httpURLPath = `https://exchange-rates.abstractapi.com/v1/convert?api_key=${apiKey}&target=${to}&base=${from}&base_amount=${amount}`;
    const httpURLPath = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;

    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // apikey: "xst3wL4iJdZv1Tu1XPvtWrh6FYWbXrTm",
        },
    };
    const response = {
        error: null,
        data: null
    }

    try {
        const res = await fetch(httpURLPath, options)
        const data = await res.json()

        if (res.status === 200) {
            response.error = null;
            response.data = data;
            return response
        }

        response.error = "Failed to convert currency."
        return response
    } catch (error) {
        response.error = "Failed to convert currency. " + error.message;
        return response
    }
}


export default convertCurrency