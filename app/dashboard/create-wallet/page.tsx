"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const pinSchema = z
  .object({
    pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d+$/, "PIN must contain only numbers"),
    confirmPin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d+$/, "PIN must contain only numbers"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  })

type PinFormValues = z.infer<typeof pinSchema>

export default function CreateWalletPage() {
  const router = useRouter()
  const { token, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  })

  async function onSubmit(data: PinFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "/api/wallet",
        {
          pin: data.pin,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      setSuccess(true)
      toast({
        title: "Wallet Created",
        description: "Your wallet has been created successfully.",
      })

      // Refresh user data
      await refreshUser()

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg)
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg)
      } else {
        setError("Failed to create wallet. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Link href="/dashboard" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Wallet</CardTitle>
          <CardDescription>Set up a secure PIN to protect your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Your wallet has been created successfully! You'll be redirected to your dashboard.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Set a 4-digit PIN to secure your wallet. You'll need this PIN for all transactions. Make sure to
                  remember it as it cannot be recovered easily.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction PIN</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm PIN</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Wallet...
                      </>
                    ) : (
                      "Create Wallet"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
