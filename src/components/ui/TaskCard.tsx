import React, { useState } from 'react';
import { Edit, Trash2, Clock, CheckCircle, Circle, MoreHorizontal } from 'lucide-react';
import { Task, TaskStatus, useTasksStore } from '../../store/tasks.store';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTaskStatus, deleteTask } = useTasksStore();
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleStatusToggle = async () => {
    const nextStatus = task.status === TaskStatus.DONE
      ? TaskStatus.OPEN
      : task.status === TaskStatus.OPEN
        ? TaskStatus.IN_PROGRESS
        : TaskStatus.DONE;

    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };



  return (
    <div className="group bg-white rounded-lg border-l-4 border-l-blue-500 shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className="flex-shrink-0 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          >
            {getStatusIcon(task.status)}
          </button>
          <h3 className={`font-medium text-sm leading-tight truncate ${task.status === TaskStatus.DONE
            ? 'line-through text-gray-500'
            : 'text-gray-900'
            }`}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all duration-200"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>

            {showActions && (
              <>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[100px]">
                  <button
                    onClick={() => {
                      onEdit(task);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </button>
                </div>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className={`text-xs leading-relaxed mb-3 ${task.status === TaskStatus.DONE
          ? 'text-gray-400'
          : 'text-gray-600'
          }`}>
          {task.description.length > 80
            ? `${task.description.substring(0, 80)}...`
            : task.description
          }
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${task.status === TaskStatus.DONE
          ? 'bg-green-100 text-green-800'
          : task.status === TaskStatus.IN_PROGRESS
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
          }`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};