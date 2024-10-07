"use client"
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react"
import { useSignIn } from "./SignInContext";

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
        return <div className="h-screen flex justify-center flex-col">
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
        <div className='text-2xl pt-20 flex justify-center'>
            <div className="flex flex-col items-start text-left max-w-lg">
            <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">{currentTask.title}</h5>
            <p className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-gray-500">Reward: {currentTask.amount/100000000}</p>
                <div>
                <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">{submitting && "Submitting..."}</h5>
                    
                </div>
            </div>
        </div>
        <div className='flex justify-center pt-8 gap-6'>
            {currentTask.options.map((option, index) => <Option onSelect={async () => {
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

            }} key={option.id} imageUrl={option.image_url} index={index + 1} />)}
        </div>
    </div>
}

function Option({ index, imageUrl, onSelect }: {
    index: number
    imageUrl: string;
    onSelect: () => void;
}) {
    return <div className="">
        <h2>option {index}</h2>
        <img onClick={onSelect} className={"h-60 rounded-md cursor-pointer hover:shadow-[0_35px_60px_-15px_rgba(81,45,168,0.4)]"} src={imageUrl} />
    </div>
}