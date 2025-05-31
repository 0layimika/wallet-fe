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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const depositSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
})

type DepositFormValues = z.infer<typeof depositSchema>

export default function DepositPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  })

  async function onSubmit(data: DepositFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "/api/wallet/deposit",
        {
          amount: Number(data.amount),
        },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      toast({
        title: "Deposit Successful",
        description: response.data.msg,
      })

      form.reset()
      router.push("/dashboard")
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg)
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg)
      } else {
        setError("Deposit failed. Please try again.")
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
          <CardTitle className="text-2xl">Deposit Funds</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₦)</FormLabel>
                    <FormControl>
                      <Input placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  Note: In a real application, this would connect to a payment gateway. For this demo, funds are added
                  directly to your wallet.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Deposit Funds"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
