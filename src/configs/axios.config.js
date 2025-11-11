import axios from "axios";
import { config } from "dotenv";

config(); 

const instanceMSDM = axios.create({
    baseURL: process.env.MSDM_URL,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json'
    }
});

export { instanceMSDM }