import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import React from 'react'

const Appbar = () => {

  
  
  
  return (
    <div className="flex justify-between border-b pb-2 pt-2 items-center">
      <div className="pl-4 flex justify-center cursor-pointer">
        <Link className="flex items-baseline gap-1" href="/">
          <h3 className='text-2xl font-bold'>Que<span className='text-[#512da8]'>$$</span></h3>
          <p className='text-sm'>worker</p>
        </Link>
      </div>
      <div className=" text-lg pr-4 flex gap-4">
        <a href="https://quezz.vercel.app" className="bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
          Switch to User
        </a>
        <WalletMultiButton />
      </div>

    </div>
  )
}

export default Appbar