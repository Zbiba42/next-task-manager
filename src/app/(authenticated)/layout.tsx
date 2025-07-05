"use client"

import { useAuthStore } from "@/store/auth.store"
import { redirect, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckSquare, User, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isLoading, initialize, user } = useAuthStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        initialize()
    }, [initialize])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        redirect("/auth/signin")
    }

    const navigationItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/tasks', label: 'Tasks' },
        { path: '/profile', label: 'Profile' }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <CheckSquare className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">TaskFlow</span>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8">
                            {navigationItems.map(item => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`text-sm font-medium transition-colors duration-200 ${pathname === item.path
                                        ? 'text-blue-600 border-b-2 border-blue-600 pb-4'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-700">{user?.fullName || 'Loading...'}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => useAuthStore.getState().signOut()}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 py-4">
                            <div className="flex flex-col space-y-3">
                                {navigationItems.map(item => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${pathname === item.path
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <div className="px-4 py-2 border-t border-gray-200 mt-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-700">{user?.fullName || 'Loading...'}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            useAuthStore.getState().signOut()
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className="w-full justify-start text-gray-500 hover:text-gray-700"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
    )
} 