"use client";
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DEFAULT_TITLE = "Select the most clickable thumbnail";

function Upload() {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [txSignature, setTxSignature] = useState("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const que$$PublicKey = "EWPnvsmjvpvuy5X9BrPzKT8zsamKu6tF4u4vGH25CTvr";

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

    router.push(`/task/${response.data.id}`)
  }
  async function makePayment() {

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey: new PublicKey(que$$PublicKey),
        lamports: 100000000,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight }
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, { minContextSlot });

    await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    setTxSignature(signature);
  }

  return (
    <div className=" px-4 flex justify-center">
      <div className="max-w-screen-lg w-full">
        <h2 className="text-2xl font-bold text-left pt-20 w-full">
          Create a task
        </h2>

        <div>
          <label className="block mt-2 text-md font-medium text-gray-900 text-black">Task details</label>

          <input onChange={(e) => {
            setTitle(e.target.value);
          }} type="text" id="first_name" className=" mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={`Example : ${DEFAULT_TITLE}`} required />
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

        <div className="flex justify-center">
          <button onClick={txSignature ? onSubmit : makePayment} type="button" className="mt-4 bg-[#512da8] cursor-pointer flex items-center text-base font-semibold text-white rounded px-6 py-2 hover:bg-[#1A1F2E]">
            {txSignature ? "Submit Task" : "Pay 0.1 SOL"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Upload;
