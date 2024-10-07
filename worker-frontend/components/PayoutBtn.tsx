"use client"
import { BACKEND_URL } from "@/utils";
import { useSignIn } from "./SignInContext";
import axios from "axios";
import React from 'react'

const PayoutBtn = () => {
    const { isConnected, balance, setBalance } = useSignIn();

    async function payout() {
        const response = await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        if (response.data.amount) {
            setBalance(0);
        }
    }
    return (
        <div>
            {isConnected ? <div className=" m-8 ">
            <button onClick={payout} type="button" className=" mx-auto bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
                Pay me out: {balance} sol
            </button>
        </div>
            :
            <></>
        }
        </div>
    )
}

export default PayoutBtn