"use client"
import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useSignIn } from "./SignInContext";

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const { isConnected } = useSignIn();

    async function onFileSelect(e: any) {
        if (!isConnected) {
            alert("Please login using your Solana Wallet!");
            return
        }
        try {
            const file = e.target.files[0];
            const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            const presignedUrl = response.data.preSignedUrl;
            const formData = new FormData();
            formData.set("bucket", response.data.fields["bucket"]);
            formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
            formData.set("X-Amz-Credential", response.data.fields["X-Amz-Credential"]);
            formData.set("X-Amz-Date", response.data.fields["X-Amz-Date"]);
            formData.set("key", response.data.fields["key"]);
            formData.set("Policy", response.data.fields["Policy"]);
            formData.set("X-Amz-Signature", response.data.fields["X-Amz-Signature"]);
            formData.set("Content-Type", response.data.fields["Content-Type"]);
            formData.append("file", file);
            const awsResponse = await axios.post(presignedUrl, formData);
            console.log("Res: " + awsResponse);

            onImageAdded(`${CLOUDFRONT_URL}/${response.data.fields["key"]}`);
        } catch (e) {
            console.log(e)
        }
    }

    if (image) {
        return (
            <div className="relative flex justify-center bg-gray-200 rounded-md">
                <div className="m-4 rounded-md overflow-hidden h-fit">
                    <img alt="image" className={"w-96"} src={image} />
                </div>
            </div>
        )
    }

    return (

        <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 border-2 border-gray-300 text-gray-500 hover:border-[#1A1F2E] hover:text-[#1A1F2E] rounded-lg shadow-lg overflow-hidden">

                <div className="relative flex flex-col items-center h-full space-y-12">
                    <input className="w-full h-full bg-red-400 cursor-pointer" type="file" style={{ position: "absolute", opacity: 0, top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%" }} onChange={onFileSelect} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p className="text-lg font-medium">Upload Image</p>
                </div>
            </div>
        </div>
    )
}