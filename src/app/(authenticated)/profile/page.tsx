"use client"

import { Button } from '@/components/ui/Button';
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/store/auth.store"
import { useState, useEffect } from "react"
import { User, Eye, EyeOff } from "lucide-react"

export default function ProfilePage() {
    const { user, updateProfile, updatePassword } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

    const [profileData, setProfileData] = useState({
        fullName: "",
        email: ""
    })
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || "",
                email: user.email || ""
            })
        }
    }, [user])

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const validateProfile = () => {
        const errors: Record<string, string> = {}

        if (!profileData.fullName.trim()) {
            errors.fullName = "Full name is required"
        } else if (profileData.fullName.trim().length < 2) {
            errors.fullName = "Full name must be at least 2 characters"
        }

        if (!profileData.email.trim()) {
            errors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            errors.email = "Please enter a valid email address"
        }

        setProfileErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validatePassword = () => {
        const errors: Record<string, string> = {}

        if (!passwordData.currentPassword) {
            errors.currentPassword = "Current password is required"
        }

        if (!passwordData.newPassword) {
            errors.newPassword = "New password is required"
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = "Password must be at least 8 characters long"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])/.test(passwordData.newPassword)) {
            errors.newPassword = "Password must contain uppercase, lowercase, and number/special character"
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = "Please confirm your new password"
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match"
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            errors.newPassword = "New password must be different from current password"
        }

        setPasswordErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateProfile()) return

        setLoading(true)
        setProfileErrors({})

        try {
            const updates: { fullName?: string; email?: string } = {}
            if (profileData.fullName !== user?.fullName) updates.fullName = profileData.fullName
            if (profileData.email !== user?.email) updates.email = profileData.email

            if (Object.keys(updates).length > 0) {
                await updateProfile(updates)
                setSuccessMessage("Profile updated successfully!")
            }
            setIsEditing(false)
        } catch (error: any) {
            setProfileErrors({
                general: error.response?.data?.message || "Failed to update profile. Please try again."
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validatePassword()) return

        setPasswordLoading(true)
        setPasswordErrors({})

        try {
            await updatePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                passwordData.confirmPassword
            )
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
            setSuccessMessage("Password updated successfully!")
        } catch (error: any) {
            setPasswordErrors({
                general: error.response?.data?.message || "Failed to update password. Please try again."
            })
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleProfileChange = (field: string, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }))
        if (profileErrors[field]) {
            setProfileErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }))
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600">Manage your account settings</p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600">{successMessage}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Personal Information
                    </h2>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsEditing(!isEditing)
                            if (isEditing) {
                                setProfileData({
                                    fullName: user.fullName || "",
                                    email: user.email || ""
                                })
                                setProfileErrors({})
                            }
                        }}
                        disabled={loading}
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </div>

                {profileErrors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-red-600">{profileErrors.general}</p>
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => handleProfileChange('fullName', e.target.value)}
                            error={profileErrors.fullName}
                            placeholder="Enter your full name"
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            error={profileErrors.email}
                            placeholder="Enter your email"
                        />
                        <div className="pt-4">
                            <Button type="submit" loading={loading}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <p className="text-gray-900">{user.fullName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <p className="text-gray-900">{user.email}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Change Password
                </h2>

                {passwordErrors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-red-600">{passwordErrors.general}</p>
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="relative">
                        <Input
                            label="Current Password"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            error={passwordErrors.currentPassword}
                            placeholder="Enter your current password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            label="New Password"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            error={passwordErrors.newPassword}
                            placeholder="Enter your new password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            label="Confirm New Password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            error={passwordErrors.confirmPassword}
                            placeholder="Confirm your new password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" loading={passwordLoading}>
                            Update Password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
} 