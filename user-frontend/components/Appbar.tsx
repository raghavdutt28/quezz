"use client"
import { BACKEND_URL } from '@/utils'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect } from 'react'

const Appbar = () => {

  const {publicKey, signMessage} = useWallet();

  async function signAndSend(){
    if(!publicKey) return;
    const message = new TextEncoder().encode("Sign in to Que$$");
    const signature = await signMessage?.(message);
    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      signature: signature,
      publicKey: publicKey?.toString()
    });
    localStorage.setItem("token", response.data.token)
  }
  useEffect(() => {
    signAndSend()
  }, [publicKey])
  return (
    <div className="flex justify-between border-b pb-2 pt-2">
        <div className="text-2xl pl-4 flex justify-center cursor-pointer">
          <Link href="/">Que$$</Link>
        </div>
        <div className=" text-lg pr-4">
        {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
        </div>
        
    </div>
  )
}

export default Appbar