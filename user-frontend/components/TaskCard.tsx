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
        <div className="flex max-h-32 flex-col text-gray-700 bg-white shadow-md bg-gray-100 hover:bg-[#1A1F2E] hover:text-white border border-gray-200 rounded-xl cursor"
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
                <p className='text-xs font-medium text-gray-400'>Total Submissions: <span className=' text-base font-semibold text-[#512da8]'>{task.total_submissions}</span></p>
            </div>
        </div>
    )
}

export default TaskCard