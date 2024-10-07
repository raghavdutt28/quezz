"use client"
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import React from 'react'

const Appbar = () => {


  return (
    <div className="flex items-center justify-between border-b pb-2 pt-2">
      <div className="text-2xl pl-4 cursor-pointer">
        <Link href="/">Que$$</Link>
      </div>
      <div className=" text-lg pr-4 flex gap-4">
        <a href="https://quezz-worker.vercel.app" className="bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
          Switch to Worker
        </a>
        {<WalletMultiButton />}
      </div>

    </div>
  )
}

export default Appbar