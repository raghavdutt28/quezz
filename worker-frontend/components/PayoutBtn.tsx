"use client"
import { BACKEND_URL } from "@/utils";
import { useSignIn } from "./SignInContext";
import axios from "axios";
import React, { useState } from 'react'

const PayoutBtn = () => {
    const { isConnected, balance, setBalance } = useSignIn();
    const [loading, setLoading] = useState(false);

    async function payout() {
        setLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });

            if (response.data.amount) {
                setBalance(0);
            }
        } catch (error) {
            console.error("Payout failed:", error);
        } finally {
            setLoading(false);
            alert("Payout Successful!");
        }
    }
    return (
        <div>
            {isConnected ? (
                <button
                    onClick={payout}
                    type="button"
                    className={`mx-auto bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E] ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={loading}
                >
                    {loading ? "Processing..." : `Pay me out: ${balance} SOL`}
                </button>
            ) : (
                <></>
            )}
        </div>
    );
}

export default PayoutBtn