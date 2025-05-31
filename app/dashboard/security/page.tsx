"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Fingerprint, Loader2, ShieldCheck, ShieldX } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { isWebAuthnSupported } from "@/lib/webauthn-utils"

export default function SecurityPage() {
  const { user, token, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isWebAuthnAvailable, setIsWebAuthnAvailable] = useState(false)
  const [hasBiometrics, setHasBiometrics] = useState(false)

  useEffect(() => {
    // Check if WebAuthn is supported
    setIsWebAuthnAvailable(isWebAuthnSupported())

    // Check if user has registered biometrics
    if (user?.credentials && user.credentials.length > 0) {
      setHasBiometrics(true)
    }
  }, [user])

  const handleRegisterBiometrics = () => {
    // Navigate to the biometric registration page
    window.location.href = "/dashboard/security/register-biometrics"
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-6">Security Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Account Security Status
            </CardTitle>
            <CardDescription>Overview of your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">Verify your email address</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user?.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.verified ? "Verified" : "Unverified"}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Biometric Authentication</p>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    hasBiometrics ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {hasBiometrics ? "Enabled" : "Not Set Up"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fingerprint className="mr-2 h-5 w-5" />
              Biometric Authentication
            </CardTitle>
            <CardDescription>Set up biometric authentication for an additional layer of security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isWebAuthnAvailable && (
              <Alert variant="destructive">
                <ShieldX className="h-4 w-4" />
                <AlertTitle>Not Supported</AlertTitle>
                <AlertDescription>
                  Your browser does not support biometric authentication. Please use a modern browser like Chrome,
                  Firefox, or Edge.
                </AlertDescription>
              </Alert>
            )}

            {isWebAuthnAvailable && !hasBiometrics && (
              <div className="space-y-4">
                <p>
                  Biometric authentication adds an extra layer of security to your account by using your device's
                  fingerprint reader or facial recognition.
                </p>
                <Button onClick={handleRegisterBiometrics} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Set Up Biometric Authentication
                    </>
                  )}
                </Button>
              </div>
            )}

            {isWebAuthnAvailable && hasBiometrics && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <AlertTitle>Biometric Authentication Enabled</AlertTitle>
                  <AlertDescription>
                    Your account is protected with biometric authentication. You'll be prompted to use it when logging
                    in from new devices or locations.
                  </AlertDescription>
                </Alert>

                <Button variant="outline" onClick={handleRegisterBiometrics}>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Add Another Device
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login History</CardTitle>
            <CardDescription>Recent login attempts to your account</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
