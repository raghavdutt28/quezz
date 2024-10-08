"use client"
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react"
import { useSignIn } from "./SignInContext";
import PayoutBtn from "./PayoutBtn";

interface Task {
    "id": number,
    "amount": number,
    "title": string,
    "options": {
        id: number;
        image_url: string;
        task_id: number
    }[]
}


// CSR
export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { isConnected, balance, setBalance } = useSignIn();

    useEffect(() => {
        if (!isConnected) return;

        const fetchTask = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BACKEND_URL}/v1/worker/nextTask`, {
                    headers: {
                        "Authorization": localStorage.getItem("token"),
                    },
                });
                setCurrentTask(res.data.task);
                setResponse(res.data.message);
            } catch (error) {
                console.error("Error fetching task:", error);
                setCurrentTask(null);
                setResponse("Failed to load the task.");
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [isConnected]);

    if (!isConnected) {
        return <div className="h-96 flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">Please login using your Solana Wallet!</h5>
            </div>
        </div>
    }

    if (loading) {
        return <div className="h-96 flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">Loading...</h5>
            </div>
        </div>
    }

    if (!currentTask) {
        return <div className="h-96 flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">{response}</h5>
            </div>
        </div>
    }

    return <div>
        <div className="relative flex min-h-screen flex-col overflow-hidden py-6 sm:py-12">
            <div className="mx-auto max-w-screen-lg p-12 w-full bg-gray-50 rounded-lg shadow-sm space-y-6">
                <div>
                    <label className="block text-md font-medium text-gray-900 text-black">Your Task</label>
                    <div className="my-2 p-2 rounded-lg bg-gray-200">
                        <h5 className="ml-4 text-xl antialiased font-semibold leading-snug tracking-normal text-gray-900">{currentTask.title}</h5>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <p className='text-xs font-medium text-gray-400'>Reward: <span className=' text-base font-semibold text-[#512da8]'>{currentTask.amount / 100000000}</span></p>
                        <span className=' text-base font-semibold text-[#512da8]'>{submitting && "Submitting..."}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-900 text-black">Choose any one!</label>
                    <div className="my-2 flex justify-center bg-gray-100 rounded-lg min-h-96">
                        <div className="py-12 m-4 grid w-full max-w-3xl sm:grid-cols-2 xl:grid-cols-2 gap-4">
                            {currentTask.options.map((option) => <Option onSelect={async () => {
                                setSubmitting(true);
                                try {
                                    const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
                                        taskId: currentTask.id.toString(),
                                        selection: option.id.toString()
                                    }, {
                                        headers: {
                                            "Authorization": localStorage.getItem("token")
                                        }
                                    });

                                    const nextTask = response.data.nextTask;
                                    if (nextTask) {
                                        setCurrentTask(nextTask)
                                    } else {
                                        setCurrentTask(null);
                                    }
                                    setBalance(balance + 0.001);
                                    // refresh the user balance in the appbar
                                } catch (e) {
                                    console.log(e);
                                }
                                setSubmitting(false);

                            }} key={option.id} imageUrl={option.image_url} />)}
                        </div>
                    </div>
                </div>
                <PayoutBtn />
            </div>
        </div>
    </div>
}

function Option({ imageUrl, onSelect }: {
    imageUrl: string;
    onSelect: () => void;
}) {
    return (
        <div onClick={onSelect} className="flex justify-center bg-gray-200 rounded-md shadow-md hover:shadow-lg cursor-pointer">
            <div className="m-4 rounded-md overflow-hidden bg-black h-fit">
                <img alt={imageUrl} className={"w-96"} src={imageUrl} />
            </div>
        </div>
    )
}