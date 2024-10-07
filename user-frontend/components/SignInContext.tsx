import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';

interface SignInContextProps {
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

  useEffect(() => {
    const signAndSend = async () => {
      if (!publicKey || isConnected) return;

      const message = new TextEncoder().encode("Sign in to Que$$");
      const signature = await signMessage?.(message);
      const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
        signature: signature,
        publicKey: publicKey?.toString(),
      });

      setIsConnected(true);
      localStorage.setItem("token", response.data.token);
    };

    signAndSend();
  }, [publicKey, isConnected, signMessage]);

  useEffect(() => {
    if (publicKey) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [publicKey]);

  return (
    <SignInContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </SignInContext.Provider>
  );
};
