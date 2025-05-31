"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Fingerprint, Loader2, ShieldCheck, ShieldX } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { isWebAuthnSupported, preparePublicKeyOptions, prepareCredentialForServer } from "@/lib/webauthn-utils"

export default function RegisterBiometricsPage() {
  const router = useRouter()
  const { user, token, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isWebAuthnAvailable, setIsWebAuthnAvailable] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if WebAuthn is supported
    setIsWebAuthnAvailable(isWebAuthnSupported())
  }, [])

  const startRegistration = async () => {
    if (!user || !token) {
      setError("You must be logged in to register biometrics")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // 1. Get registration options from server
      const response = await axios.post(
        "/api/auth/biometric/register",
        { userId: user._id },
        { headers: { "x-auth-token": token } },
      )

      console.log(response.data)

      // 2. Prepare options for the browser API
      const publicKeyOptions = preparePublicKeyOptions(response.data.options)

      // 3. Start the registration process
      setIsRegistering(true)

      // 4. Create credentials
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential
      console.log("credential:",credential)

      // 5. Prepare credential for server
      const credentialForServer = prepareCredentialForServer(credential)

      // 6. Verify registration with server
      const verificationResponse = await axios.post(
        "/api/auth/biometric/register-verify",
        {
          userId: user._id,
          credentialResponse: credentialForServer,
        },
        { headers: { "x-auth-token": token } },
      )

      if (verificationResponse.data.verified) {
        setSuccess(true)
        toast({
          title: "Biometric Registration Successful",
          description: "Your device has been registered for biometric authentication.",
        })

        // Refresh user data
        await refreshUser()

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard/security")
        }, 2000)
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Biometric registration error:", err)
      if (err.name === "NotAllowedError") {
        setError("Registration was cancelled or timed out. Please try again.")
      } else if (err.name === "NotSupportedError") {
        setError("Your device doesn't support the requested authentication method.")
      } else if (err.response?.data) {
        setError(err.response.data.message || "Registration failed. Please try again.")
      } else {
        setError("An error occurred during registration. Please try again.")
      }
    } finally {
      setIsLoading(false)
      setIsRegistering(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Link href="/dashboard/security" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to security settings
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Fingerprint className="mr-2 h-5 w-5" />
            Register Biometric Authentication
          </CardTitle>
          <CardDescription>Set up your device for secure biometric login</CardDescription>
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertTitle>Registration Successful</AlertTitle>
              <AlertDescription>
                Your device has been registered for biometric authentication. You'll be redirected shortly.
              </AlertDescription>
            </Alert>
          )}

          {isWebAuthnAvailable && !success && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">How it works:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Your device will prompt you to use your fingerprint, face, or security key</li>
                  <li>No biometric data is sent to our servers - it stays securely on your device</li>
                  <li>You'll use this same method when logging in from new locations</li>
                </ul>
              </div>

              {isRegistering ? (
                <div className="text-center py-8">
                  <Fingerprint className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
                  <p className="font-medium">Follow the prompts on your device</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use your fingerprint, face recognition, or security key when prompted
                  </p>
                </div>
              ) : (
                <Button onClick={startRegistration} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Register This Device
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
