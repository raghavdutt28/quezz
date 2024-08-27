"use client"
import { BACKEND_URL } from '@/utils'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Appbar = () => {

  const { publicKey, signMessage } = useWallet();
  const [balance, setBalance] = useState(0);

  async function payout() {
    console.log("payout clicked");
    const response = await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });
    if (response.data.amount == balance) {
      setBalance(0);
    }
  }

  async function signAndSend() {
    if (!publicKey) { return };
    const message = new TextEncoder().encode("Sign in to Que$$ as a worker");
    const signature = await signMessage?.(message);
    const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
      signature: signature,
      publicKey: publicKey?.toString()
    });
    localStorage.setItem("token", response.data.token);
    setBalance((response.data.amount));
  }
  useEffect(() => {
    signAndSend()
  }, [publicKey])
  return (
    <div className="flex justify-between border-b pb-2 pt-2 items-center">
      <div className="pl-4 flex justify-center cursor-pointer">
        <Link className="flex items-baseline gap-1" href="/">
          <h3 className='text-2xl'>Que$$</h3>
          <p className='text-sm'>worker</p>
        </Link>
      </div>
      <div className=" text-lg pr-4 flex gap-4">
        <a href="https://quezz.vercel.app" className="bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
          Switch to User
        </a>
        <button onClick={payout} type="button" className="bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
          Pay me out: {balance} sol
        </button>
        {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
      </div>

    </div>
  )
}

export default Appbar