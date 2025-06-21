"use client"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import React from 'react'

const FullMenu = () => {
  return (
    <ul className=" text-lg pr-4 flex gap-4">
        <li className=''><Link href="https://quezz.vercel.app" className="bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-3 hover:bg-[#1A1F2E]">
          Switch to User
        </Link></li>
        <li>{<WalletMultiButton />}</li>
      </ul>
  )
}

export default FullMenu