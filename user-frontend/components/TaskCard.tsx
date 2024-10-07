import React from 'react';

interface Task {
    id: number;
    title: string;
    total_submissions: number;
}

interface TaskCardProps {
    task: Task
    onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {

    return (
        <div className="flex flex-col mt-6 text-gray-700 bg-white shadow-md bg-gray-100 hover:bg-[#1A1F2E] hover:text-white border border-gray-200 rounded-xl "
            onClick={onClick}
        >
            <div className="h-full p-4 flex flex-col items-start justify-between">
                <h5 className="mb-2 text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900"
                style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    WebkitLineClamp: 2,
                }}
                >
                    {task.title}
                </h5>
                <p className='text-xs'>Total Submissions: {task.total_submissions}</p>
            </div>
        </div>
    )
}

export default TaskCard