"use client"
import { useSignIn } from "@/components/SignInContext";
import { BACKEND_URL } from "@/utils";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


async function getTaskDetails(taskId: string) {


    const response = await axios.get(`${BACKEND_URL}/v1/user/task?taskId=${taskId}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    })
    return response.data;
}

export default function TaskDetailPage({ params: { taskId } }: { params: { taskId: string } }) {
    const [result, setResult] = useState<Record<string, {
        count: number;
        option: {
            imageUrl: string
        }
    }>>({})
    const [taskDetails, setTaskDetails] = useState<{ title?: string }>({});
    const { isConnected } = useSignIn();
    const router = useRouter();
    useEffect(() => {

        if (!isConnected) {
            router.push("/");
            return;
        }

        getTaskDetails(taskId).then((data) => {
            setResult(data.result);
            setTaskDetails(data.taskDetails);
            console.log(data.result);
        })
    }, [taskId]);

    useEffect(() => {
        if (!isConnected) {
            setResult({});
            setTaskDetails({});
            alert("Please login using your Solana Wallet!");
            router.push("/");
            return;
        }
    }, [isConnected]);

    if (!isConnected) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-gray-900">Please login using your Solana Wallet!</h5>
            </div>
        </div>

    }

    return (

        <div className="relative flex min-h-screen flex-col overflow-hidden py-6 sm:py-12">
            <div className="mx-auto max-w-screen-lg p-12 w-full bg-gray-50 rounded-lg shadow-sm space-y-6">
                <div>
                    <label className="block text-md font-medium text-gray-900 text-black">Your Task</label>
                    <div className="my-2 p-2 rounded-lg bg-gray-200">
                        <h5 className="ml-4 text-xl antialiased font-semibold leading-snug tracking-normal text-gray-900">{taskDetails.title}</h5>
                    </div>
                </div>
                <div>
                    <label className="block text-md font-medium text-gray-900 text-black">Options</label>
                    <div className="my-2 flex justify-center bg-gray-100 rounded-lg min-h-96">
                        <div className="py-12 grid w-full max-w-3xl sm:grid-cols-2 xl:grid-cols-2 gap-2">
                            {Object.keys(result || {}).map((taskId) => (
                                <Option key={taskId} imageUrl={result[taskId].option.imageUrl} votes={result[taskId].count} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

function Option({ imageUrl, votes }: { imageUrl: string, votes: number }) {
    return (
        <div className="relative flex justify-center bg-gray-200 rounded-md">
            <div className="m-4 rounded-md overflow-hidden bg-black h-fit">
                <img alt={imageUrl} className={"w-96"} src={imageUrl} />
            </div>
            <div className="absolute bottom-8 rounded-lg bg-[#512da8] w-[180px]">
                <div className="flex justify-center items-end gap-1 py-1">
                    <span className=' text-2xl font-semibold text-white'>{votes}</span>
                    <p className='text-xs font-medium text-white pb-[4px]'>votes</p>
                </div>
            </div>
        </div>
    );
}


