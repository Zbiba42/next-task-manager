"use client"

import { useAuthStore } from "@/store/auth.store"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

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

  if (isAuthenticated) {
    redirect("/dashboard")
  } else {
    redirect("/auth/signin")
  }

  return null
}
