import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';


const MobMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            <div onClick={handleOpen} className="menu-icon cursor-pointer z-50 relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-6" 
                    fill="none"
                    viewBox="0 0 26 24"
                    stroke="#512da8"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h20M3 12h20M3 18h20" />
                </svg>


            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity" />
            )}

            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-screen w-1/2 min-w-[210px] max-w-[270px] bg-white z-50 text-dark
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-[20px] flex flex-col gap-[20px] h-full">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold">Menu</h3>
                        <div onClick={handleClose} className="cursor-pointer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="#512da8"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>

                    <ul className="list-none flex flex-col mt-4 gap-4">

                        <li className=' rounded w-full flex items-center bg-[#512da8] hover:bg-[#1A1F2E] cursor-pointer'><Link onClick={handleClose} href="https://quezz.vercel.app" className=" text-base font-semibold text-white px-6 py-3 whitespace-nowrap ">
                            Switch to Worker
                        </Link></li>
                        <li className=' w-full bg-[#512da8] cursor-pointer flex items-center rounded hover:bg-[#1A1F2E]' onClick={handleClose}>{<WalletMultiButton />}</li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default MobMenu;