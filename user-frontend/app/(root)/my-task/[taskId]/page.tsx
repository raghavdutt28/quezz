"use client"
import { useSignIn } from "@/components/SignInContext";
import { BACKEND_URL } from "@/utils";
import axios from 'axios';
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
    const [taskDetails, setTaskDetails] = useState<{ title?: string }>({})
    useEffect(() => {
        getTaskDetails(taskId).then((data) => {
            setResult(data.result);
            setTaskDetails(data.taskDetails);
            console.log(data.result);
        })
    }, [taskId]);

    return (
        <div>
            <div className="text-2xl pt-20 flex justify-center">
                {
                    taskDetails.title
                }
            </div>
            <div className="flex justify-center pt-8">
                {Object.keys(result || {}).map((taskId) => (
                    <Option key={taskId} imageUrl={result[taskId].option.imageUrl} votes={result[taskId].count} />
                ))}
            </div>
        </div>
    );
}

function Option({ imageUrl, votes }: { imageUrl: string, votes: number }) {
    return (
        <div>
            <img alt={imageUrl} className={"p-2 w-96 rounded"} src={imageUrl} />
            <div className="flex justify-center">{votes}</div>
        </div>
    );
}
