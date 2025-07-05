import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, useTasksStore } from '../../store/tasks.store';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.OPEN
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { createTask, updateTask } = useTasksStore();
  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status
      });
    }
  }, [task]);

  const statusOptions = [
    { value: TaskStatus.OPEN, label: 'Open' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && task) {
        // Update the task with new data
        const updates: { title?: string; description?: string; status?: TaskStatus } = {};
        if (formData.title !== task.title) updates.title = formData.title;
        if (formData.description !== task.description) updates.description = formData.description;
        if (formData.status !== task.status) updates.status = formData.status;

        if (Object.keys(updates).length > 0) {
          await updateTask(task.id, updates);
        }
      } else {
        await createTask(formData.title, formData.description);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({ general: 'Failed to save task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        name="title"
        type="text"
        label="Task Title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter task title"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
            }`}
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {isEditing && (
        <Select
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />
      )}

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};