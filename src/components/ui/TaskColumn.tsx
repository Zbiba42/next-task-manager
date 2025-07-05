import React from 'react';
import { TaskStatus, Task } from '../../store/tasks.store';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onEditTask }) => {
  const statusLabels = {
    [TaskStatus.OPEN]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.DONE]: 'Done'
  };

  const statusColors = {
    [TaskStatus.OPEN]: 'bg-gray-100 text-gray-800',
    [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [TaskStatus.DONE]: 'bg-green-100 text-green-800'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{statusLabels[status]}</h2>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Tasks Area */}
      <div className="flex-1 min-h-[200px] space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};