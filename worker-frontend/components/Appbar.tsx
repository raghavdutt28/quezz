"use client"
import { BACKEND_URL } from '@/utils'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Appbar = () => {

  const {publicKey, signMessage} = useWallet();
  const [balance, setBalance] = useState(0);

  async function payout(){
    console.log("payout clicked");
    const response = await axios.post(`${BACKEND_URL}/v1/worker/payout`,{},  {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });
    if(response.data.amount == balance){
      setBalance(0);
    }
  }

  async function signAndSend(){
    if(!publicKey) {return};
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
    <div className="flex justify-between border-b pb-2 pt-2">
        <div className="text-2xl pl-4 flex justify-center cursor-pointer">
          <Link href="/">Que$$</Link>
        </div>
        <div className=" text-lg pr-4 flex">
        <button onClick={payout} type="button" className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
            Pay Me Out: {balance} sol
          </button>
        {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
        </div>
        
    </div>
  )
}

export default Appbar