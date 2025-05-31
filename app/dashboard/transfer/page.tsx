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
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const transferSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  acc_num: z.string().length(10, "Account number must be 10 digits"),
  bank: z.string().min(1, "Bank name is required"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  description: z.string().optional(),
})

type TransferFormValues = z.infer<typeof transferSchema>

export default function TransferPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      acc_num: "",
      bank: "",
      pin: "",
      description: "",
    },
  })

  async function onSubmit(data: TransferFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "/api/wallet/transfer",
        {
          amount: Number(data.amount),
          acc_num: data.acc_num,
          bank: data.bank,
          pin: data.pin,
          description: data.description || "Transfer",
        },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      toast({
        title: "Transfer Successful",
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
        setError("Transfer failed. Please try again.")
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
          <CardTitle className="text-2xl">Send Money</CardTitle>
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

              <FormField
                control={form.control}
                name="acc_num"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What's this for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction PIN</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Send Money"
                )}
              </Button>

              <div className="text-center text-sm">
                <Link href="/dashboard/beneficiaries" className="font-medium underline">
                  Send to saved beneficiary
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
