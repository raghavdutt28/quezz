"use client";
import { useSignIn } from '@/components/SignInContext';
import TaskCard from '@/components/TaskCard';
import { BACKEND_URL } from '@/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


interface Task {
  id: number;
  title: string;
  total_submissions: number;
}


const Page = () => {
  const { isConnected } = useSignIn();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const handleClick = (task: Task) => {
    router.push(`/my-task/${task.id}`);
  }

  useEffect(() => {
    if (!isConnected) {
      alert("Please login using your Solana Wallet!");
      router.push("/");
      return;
    }

    const fetchTasks = async () => {
      try {
        console.log("fetching")
        const response = await axios.get(`${BACKEND_URL}/v1/user/myTasks`, {
          headers: {
            "Authorization": localStorage.getItem("token"),
          },
        });
        console.log(response, response.data);
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isConnected, router]);

  if (!isConnected || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>

      {
        tasks.length > 0 ? (
          <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray- py-6 sm:py-12">
            <div className="mx-auto max-w-screen-xl px-4 w-full">
              <div className="grid w-full sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {tasks.map((task, index) => <TaskCard key={index} task={task} onClick={() => { handleClick(task) }} />)}
              </div>
            </div>
          </div>
        ) : (
          <div className='m-8 flex'>
            <h5 className='block mx-auto text-xl antialiased font-semibold leading-snug tracking-normal text-gray-500'>No tasks found!</h5>
          </div>
        )
      }
    </div>

  );
};

export default Page;
