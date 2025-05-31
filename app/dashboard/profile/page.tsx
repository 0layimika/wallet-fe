"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = () => {
    setIsLoggingOut(true)
    logout()
    router.push("/")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>{user?.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{user?.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p>{user?.account_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                <p>{user?.verified ? "Verified" : "Unverified"}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Security</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p>Email Verification</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${user?.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {user?.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p>Biometric Authentication</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${user?.credentials?.length ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {user?.credentials?.length ? "Enabled" : "Not Set Up"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Login History</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {user?.login_history
                  ?.slice()
                  .reverse()
                  .map((login: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded-md">
                      <p className="font-medium">{new Date(login.time).toLocaleString()}</p>
                      <p className="text-muted-foreground">{login.device}</p>
                      <p className="text-muted-foreground">
                        {login.location} ({login.ip})
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
