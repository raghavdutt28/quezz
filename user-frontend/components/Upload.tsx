"use client";
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignIn } from "./SignInContext";

const DEFAULT_TITLE = "Select the most clickable thumbnail";

function Upload() {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [txSignature, setTxSignature] = useState("");
  const [txConfirmed, setTxConfirmed] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const {isConnected} = useSignIn();
  const router = useRouter();
  const que$$PublicKey = "EWPnvsmjvpvuy5X9BrPzKT8zsamKu6tF4u4vGH25CTvr";

  async function handleMyTaskClick(){
    if(!isConnected){
      alert("Please login using your Solana Wallet!");
      return
    }
    router.push(`/my-task`);
  }

  async function onSubmit() {
    const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
      options: images.map(image => ({
        imageUrl: image,
      })),
      title,
      signature: txSignature
    }, {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    })

    router.push(`/my-task/${response.data.id}`)
  }

  async function makePayment() {

    if(!isConnected){
      alert("Please login using your Solana Wallet!");
      return
    }

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: publicKey!,
      toPubkey: new PublicKey(que$$PublicKey),
      lamports: 100000000,
    });

    const latestBlockhash = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: publicKey!,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [transferInstruction],
    }).compileToV0Message();


    const transaction = new VersionedTransaction(messageV0);


    const signature = await sendTransaction(transaction, connection);
    setTxSignature(signature);

    // Polling for transaction status using getSignatureStatus
    let confirmed = false;
    while (!confirmed) {
      const status = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });

      if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
        setTxConfirmed(true);
        confirmed = true;
        console.log('Transaction confirmed:', status.value);
      } else if (status.value?.err) {
        console.error('Transaction failed:', status.value.err);
        break;
      } else {
        console.log('Transaction not yet confirmed, checking again...');
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 2 seconds before checking again
      }
    }
  }
  const buttonText =
    txSignature ?
      txConfirmed ? "Submit Task" : "Confirming..."
      : "Pay 0.1 SOL";

  return (
    <div className=" my-2 px-2 flex justify-center">
      <div className="max-w-screen-lg w-full">
        <h2 className="text-2xl font-bold text-left pt-8 w-full">
          Create a task
        </h2>

        <div>
          <label className="block mt-2 text-md font-medium text-gray-900 text-black">Task details</label>

          <input onChange={(e) => {
            setTitle(e.target.value);
          }} type="text" id="first_name" className=" mt-1 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder={`Example : ${DEFAULT_TITLE}`} required />
        </div>

        <label className="block mt-8 text-md font-medium text-gray-900 text-black">Add Images</label>
        <div className="flex justify-center pt-4 max-w-screen-lg">
          {images.map((image, index) => <UploadImage key={index} image={image} onImageAdded={(imageUrl) => {
            setImages(i => [...i, imageUrl]);
          }} />)}
        </div>

        <div className="mx-2 pt-2 flex justify-center">
          <UploadImage onImageAdded={(imageUrl) => {
            setImages(i => [...i, imageUrl]);
          }} />
        </div>

        <div className="flex justify-center items-center gap-4 mt-12">
          <button onClick={txSignature ? onSubmit : makePayment} type="button" className="bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
            {buttonText}
          </button>
          <button onClick={handleMyTaskClick} type="button" className="border-2 border-[#512da8] cursor-pointer flex items-center text-base font-semibold text-[#512da8] rounded px-6 py-2 hover:border-[#1A1F2E] hover:text-[#1A1F2E]">
            My Tasks
          </button>
        </div>

      </div>
    </div>
  );
}

export default Upload;
