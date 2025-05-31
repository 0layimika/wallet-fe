"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import TransactionList from "@/components/transaction-list"

export default function TransactionsPage() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await axios.get("/api/wallet/history", {
          headers: {
            "x-auth-token": token,
          },
        })
        setTransactions(response.data.transactions || [])
      } catch (err) {
        setError("Failed to load transaction history")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchTransactions()
    }
  }, [token])

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="flex items-center text-sm mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
