"use client"

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from '@/components/ui/TaskForm';
import { TaskColumn } from '@/components/ui/TaskColumn';
import { TaskStatus, useTasksStore } from "@/store/tasks.store"
import { useEffect, useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Search, Filter } from "lucide-react"

export default function TasksPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<any>(null)
    const { tasks, isLoading, error, getTasksIfNeeded } = useTasksStore()
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        getTasksIfNeeded()
    }, [getTasksIfNeeded])

    useEffect(() => {
        const shouldCreate = searchParams.get('create')
        if (shouldCreate === 'true') {
            setIsCreateModalOpen(true)
            router.replace('/tasks', { scroll: false })
        }
    }, [searchParams, router])

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchTerm, statusFilter]);

    const getTasksByStatus = (status: TaskStatus) => {
        return filteredTasks.filter(task => task.status === status);
    };



    const handleEditTask = (task: any) => {
        setEditingTask(task);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingTask(null);
    };



    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-600 mt-2">
                        Organize and track your tasks with our intuitive kanban board
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 sm:mt-0"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="md:w-48 flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            {Object.values(TaskStatus).map((status) => (
                                <option key={status} value={status}>
                                    {status.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
                {Object.values(TaskStatus).map(status => (
                    <div key={status} className="bg-gray-50 rounded-xl p-4">
                        <TaskColumn
                            status={status}
                            tasks={getTasksByStatus(status)}
                            onEditTask={handleEditTask}
                        />
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-8">
                    <div className="max-w-md mx-auto">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || statusFilter !== 'ALL' ? 'No tasks found' : 'No tasks yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || statusFilter !== 'ALL'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first task to get started with task management'
                            }
                        </p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Task
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                title="Create New Task"
            >
                <TaskForm onClose={handleCloseModal} />
            </Modal>

            <Modal
                isOpen={!!editingTask}
                onClose={handleCloseModal}
                title="Edit Task"
            >
                {editingTask && (
                    <TaskForm
                        task={editingTask}
                        onClose={handleCloseModal}
                    />
                )}
            </Modal>
        </div>
    )
} 