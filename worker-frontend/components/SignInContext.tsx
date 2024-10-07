import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';

interface SignInContextProps {

  balance: number;
  setBalance:React.Dispatch<React.SetStateAction<number>>;

  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignInContext = createContext<SignInContextProps | undefined>(undefined);

export const useSignIn = () => {
  const context = useContext(SignInContext);
  if (!context) {
    throw new Error("useSignIn must be used within a SignInProvider");
  }
  return context;
};

export const SignInProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, signMessage } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const signAndSend = async () => {
      if (!publicKey || isConnected) return;

      const message = new TextEncoder().encode("Sign in to Que$$ as a worker");
      const signature = await signMessage?.(message);
      const response = await axios.post(`${BACKEND_URL}/v1/worker/signIn`, {
        signature: signature,
        publicKey: publicKey?.toString(),
      });
      localStorage.setItem("token", response.data.token);
      setIsConnected(true);
      setBalance((response.data.amount));
    };

    signAndSend();
  }, [publicKey, isConnected, signMessage]);

  useEffect(() => {
    if (!publicKey) {
      setIsConnected(false);
    }
  }, [publicKey]);

  return (
    <SignInContext.Provider value={{balance, setBalance, isConnected, setIsConnected }}>
      {children}
    </SignInContext.Provider>
  );
};
