"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  pin: z.string().length(4, "PIN must be 4 digits"),
  description: z.string().optional(),
})

type TransferFormValues = z.infer<typeof transferSchema>

export default function BeneficiaryTransferPage() {
  const router = useRouter()
  const params = useParams()
  const { token, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [beneficiary, setBeneficiary] = useState<any>(null)

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      pin: "",
      description: "",
    },
  })

  useEffect(() => {
    if (user?.beneficiary) {
      const ben = user.beneficiary.find((b: any) => b._id === params.id)
      if (ben) {
        setBeneficiary(ben)
      } else {
        setError("Beneficiary not found")
      }
    }
  }, [user, params.id])

  async function onSubmit(data: TransferFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(
        `/api/wallet/transfer/${params.id}`,
        {
          amount: Number(data.amount),
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
      <Link href="/dashboard/beneficiaries" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to beneficiaries
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Send to {beneficiary?.name || "Beneficiary"}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {beneficiary && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">{beneficiary.name}</p>
              <p className="text-sm text-muted-foreground">
                {beneficiary.bank} - {beneficiary.account_number}
              </p>
            </div>
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
