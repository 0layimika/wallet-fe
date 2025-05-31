"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Fingerprint } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { preparePublicKeyOptions, prepareCredentialForServer, isWebAuthnSupported } from "@/lib/webauthn-utils"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [authStep, setAuthStep] = useState<string | null>(null)
  const [authData, setAuthData] = useState<any>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/auth", data)

      // If login is successful with no additional verification
      if (response.status === 200) {
        login(response.data.token, response.data.user)
        router.push("/dashboard")
        return
      }

      // Handle multi-factor authentication steps
      if (response.status === 202) {
        console.log(response.data)
        setAuthStep(response.data.step)
        setAuthData(response.data)
        return
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg)
      } else {
        setError("Login failed. Please check your credentials and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Link href="/" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!authStep ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-medium underline">
                    Create account
                  </Link>
                </div>
              </form>
            </Form>
          ) : (
            <AuthStepHandler
              step={authStep}
              data={authData}
              onComplete={(token, user) => {
                login(token, user)
                router.push("/dashboard")
              }}
              onError={setError}
              onBack={() => setAuthStep(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface AuthStepHandlerProps {
  step: string
  data: any
  onComplete: (token: string, user: any) => void
  onError: (error: string) => void
  onBack: () => void
}

function AuthStepHandler({ step, data, onComplete, onError, onBack }: AuthStepHandlerProps) {
  if (step === "email_otp") {
    return <EmailOtpVerification data={data} onComplete={onComplete} onError={onError} onBack={onBack} />
  }

  if (step === "qr_code") {
    return <QrCodeVerification data={data} onComplete={onComplete} onError={onError} onBack={onBack} />
  }

  if (step === "biometric") {
    return <BiometricVerification data={data} onComplete={onComplete} onError={onError} onBack={onBack} />
  }

  return (
    <div className="text-center py-4">
      <p>Unknown verification step required.</p>
      <Button onClick={onBack} variant="outline" className="mt-4">
        Back to Login
      </Button>
    </div>
  )
}

function EmailOtpVerification({ data, onComplete, onError, onBack }: AuthStepHandlerProps) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Create a form schema for OTP
  const otpSchema = z.object({
    otp: z.string().min(6, "OTP must be at least 6 characters"),
  })

  // Use the form hook
  const form = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function onSubmit(values: { otp: string }) {
    setIsLoading(true)
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email: data.email,
        otp: values.otp,
      })
      onComplete(response.data.token, response.data.user)
    } catch (err: any) {
      onError(err.response?.data || "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="mb-4">
        <AlertDescription>{data.message}</AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter OTP</FormLabel>
                <FormControl>
                  <Input placeholder="123456" maxLength={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <Button type="button" onClick={onBack} variant="outline" className="w-full">
            Back to Login
          </Button>
        </form>
      </Form>
    </div>
  )
}

function QrCodeVerification({ data, onComplete, onError, onBack }: AuthStepHandlerProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Create a form schema for QR code verification
  const qrSchema = z.object({
    otp: z.string().min(6, "Code must be at least 6 characters"),
  })

  // Use the form hook
  const form = useForm<{ otp: string }>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function onSubmit(values: { otp: string }) {
    setIsLoading(true)
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email: data.email,
        otp: values.otp,
      })
      onComplete(response.data.token, response.data.user)
    } catch (err: any) {
      onError(err.response?.data || "QR verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="mb-4">
        <AlertDescription>{data.message}</AlertDescription>
      </Alert>

      <div className="flex justify-center mb-4">
        {data.qr && <img src={data.qr || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter Code from QR</FormLabel>
                <FormControl>
                  <Input placeholder="123456" maxLength={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>

          <Button type="button" onClick={onBack} variant="outline" className="w-full">
            Back to Login
          </Button>
        </form>
      </Form>
    </div>
  )
}

function BiometricVerification({ data, onComplete, onError, onBack }: AuthStepHandlerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [hasBiometrics, setHasBiometrics] = useState(true)
  const [webAuthnSupported, setWebAuthnSupported] = useState(true)

  // Check if WebAuthn is supported
  useEffect(() => {
    setWebAuthnSupported(isWebAuthnSupported())
  }, [])

  async function authenticateWithBiometrics() {
    if (!webAuthnSupported) {
      onError("Your browser doesn't support biometric authentication")
      return
    }

    setIsLoading(true)
    setIsAuthenticating(true)

    try {
      // 1. Get authentication options from server
      const optionsResponse = await axios.post("/api/auth/biometric/generate", {
        userId: data.userId,
      })

      // 2. Prepare options for the browser API
      const publicKeyOptions = preparePublicKeyOptions(optionsResponse.data)

      // 3. Get credentials from browser
      const credential = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential

      // 4. Prepare credential for server
      const credentialForServer = prepareCredentialForServer(credential)

      // 5. Verify with server
      const verification = await axios.post("/api/auth/biometric/verify", {
        userId: data.userId,
        credentialResponse: credentialForServer,
      })

      // 6. Complete authentication
      onComplete(verification.data.token, verification.data.user)
    } catch (err: any) {
      console.error("Biometric authentication error:", err)
      if (err.name === "NotAllowedError") {
        onError("Authentication was cancelled or timed out. Please try again.")
      } else if (err.name === "NotSupportedError") {
        onError("Your device doesn't support the requested authentication method.")
      } else if (err.response?.data) {
        onError(err.response.data.message || "Authentication failed. Please try again.")
      } else {
        onError("Biometric authentication failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
      setIsAuthenticating(false)
    }
  }

  if (!webAuthnSupported) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Your browser doesn't support biometric authentication. Please use a modern browser like Chrome, Firefox, or
            Edge.
          </AlertDescription>
        </Alert>
        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="mb-4">
        <AlertDescription>{data?.message || "High risk detected. Biometric authentication required."}</AlertDescription>
      </Alert>

      {isAuthenticating ? (
        <div className="text-center py-8">
          <div className="h-16 w-16 mx-auto mb-4 animate-pulse">
            <Fingerprint className="h-16 w-16 text-primary" />
          </div>
          <p className="font-medium">Follow the prompts on your device</p>
          <p className="text-sm text-muted-foreground mt-2">
            Use your fingerprint, face recognition, or security key when prompted
          </p>
        </div>
      ) : hasBiometrics ? (
        <Button onClick={authenticateWithBiometrics} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Authenticate with Biometrics"
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">
            You need to register your device for biometric authentication first. Please log in with your password and
            then set up biometrics in your security settings.
          </p>
          <Button onClick={onBack} variant="outline" className="w-full">
            Back to Login
          </Button>
        </div>
      )}

      {hasBiometrics && (
        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Login
        </Button>
      )}
    </div>
  )
}
