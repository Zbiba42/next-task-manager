"use client"

import { Button } from '@/components/ui/Button';
import { TaskStatus, useTasksStore } from "@/store/tasks.store"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"
import Link from "next/link"
import { CheckSquare, Plus, BarChart3, Clock } from "lucide-react"

export default function DashboardPage() {
    const { tasks, isLoading, error, getTasksIfNeeded } = useTasksStore()
    const { user } = useAuthStore()

    useEffect(() => {
        getTasksIfNeeded()
    }, [getTasksIfNeeded])

    const getTaskStats = () => {
        const total = tasks.length
        const open = tasks.filter((t) => t.status === TaskStatus.OPEN).length
        const inProgress = tasks.filter(
            (t) => t.status === TaskStatus.IN_PROGRESS
        ).length
        const done = tasks.filter((t) => t.status === TaskStatus.DONE).length
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

        return { total, open, inProgress, done, completionRate }
    }

    const stats = getTaskStats()
    const recentTasks = tasks
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.fullName}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's an overview of your tasks and productivity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Tasks"
                    value={stats.total}
                    icon={<CheckSquare className="h-6 w-6 text-blue-600" />}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Open Tasks"
                    value={stats.open}
                    icon={<Clock className="h-6 w-6 text-gray-600" />}
                    color="bg-gray-100"
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={<BarChart3 className="h-6 w-6 text-yellow-600" />}
                    color="bg-yellow-100"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    icon={<CheckSquare className="h-6 w-6 text-green-600" />}
                    color="bg-green-100"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/tasks?create=true">
                        <Button className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Task
                        </Button>
                    </Link>
                    <Link href="/tasks">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            View All Tasks
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View all
                    </Link>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No tasks yet</p>
                        <Link href="/tasks?create=true">
                            <Button>Create Your First Task</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-medium ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                        {task.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate mt-1">
                                        {task.description}
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === TaskStatus.DONE
                                        ? 'bg-green-100 text-green-800'
                                        : task.status === TaskStatus.IN_PROGRESS
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 