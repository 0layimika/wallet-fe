"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Loader2, Plus, Send, Star, StarOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const beneficiarySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  account_number: z.string().length(10, "Account number must be 10 digits"),
  bank: z.string().min(2, "Bank name is required"),
})

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>

export default function BeneficiariesPage() {
  const { token,refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState<any[]>([])

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      account_number: "",
      bank: "",
    },
  })

  useEffect(() => {
    async function fetchBeneficiaries() {
      try {
        const response = await axios.get("/api/users/beneficiary", {
          headers: {
            "x-auth-token": token,
          },
        })
        setBeneficiaries(response.data)
      } catch (err) {
        console.error("Failed to fetch beneficiaries", err)
      }
    }

    if (token) {
      fetchBeneficiaries()
    }
  }, [token])

  async function onSubmit(data: BeneficiaryFormValues) {
    setIsLoading(true)
    setError("")

    try {
      await axios.post("/api/users/beneficiary", data, {
        headers: {
          "x-auth-token": token,
        },
      })

      toast({
        title: "Beneficiary Added",
        description: `${data.name} has been added to your beneficiaries.`,
      })

      form.reset()
      setShowForm(false)

      // Refresh beneficiaries list
      const response = await axios.get("/api/users/beneficiary", {
        headers: {
          "x-auth-token": token,
        },
      })
      setBeneficiaries(response.data)

      // Refresh user data to update the UI
      refreshUser()
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg)
      } else {
        setError("Failed to add beneficiary. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleFavorite(id: string) {
    try {
      await axios.put(
        `/api/users/beneficiary/${id}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      // Update local state
      setBeneficiaries(beneficiaries.map((ben) => (ben._id === id ? { ...ben, favorite: !ben.favorite } : ben)))

      // Refresh user data
      refreshUser()
    } catch (err) {
      console.error("Failed to update favorite status", err)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>

        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Beneficiary
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Beneficiary</CardTitle>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_number"
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Beneficiary"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Beneficiaries</CardTitle>
        </CardHeader>
        <CardContent>
          {beneficiaries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No beneficiaries added yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Beneficiary
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {beneficiaries.map((ben) => (
                <div key={ben._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{ben.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ben.bank} - {ben.account_number}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => toggleFavorite(ben._id)}>
                      {ben.favorite ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Link href={`/dashboard/transfer/${ben._id}`}>
                      <Button size="sm">
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
