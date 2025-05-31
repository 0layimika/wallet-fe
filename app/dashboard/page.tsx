"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CreditCard, DollarSign, Send, User, Users, Wallet } from "lucide-react"
import Link from "next/link"
import TransactionList from "@/components/transaction-list"

interface WalletData {
  balance: number
  transactions: Transaction[]
}

interface Transaction {
  _id: string
  type: string
  amount: number
  date: string
}

interface Beneficiary {
  _id: string
  name: string
  account_number: string
  bank: string
  favorite?: boolean
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [walletExists, setWalletExists] = useState(true)

  useEffect(() => {
    async function fetchWallet() {
      try {
        const response = await axios.get("/api/wallet", {
          headers: {
            "x-auth-token": token,
          },
        })
        setWallet(response.data)
        setWalletExists(true)
      } catch (err: any) {
        if (err.response?.status === 404) {
          setWalletExists(false)
        } else {
          setError("Failed to load wallet data")
          console.error(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) fetchWallet()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!walletExists) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Wallet</CardTitle>
            <CardDescription>You need to set up your wallet to start using the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Before you can send or receive money, you need to create a wallet and set up a transaction PIN.
              </p>
            </div>
            <Link href="/dashboard/create-wallet">
              <Button className="w-full">
                <Wallet className="mr-2 h-4 w-4" />
                Create Wallet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const favoriteBeneficiaries = (user?.beneficiary || []).filter((b: Beneficiary) => b.favorite)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name?.split(" ")[0] || "User"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/transfer">
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Money
            </Button>
          </Link>
          <Link href="/dashboard/deposit">
            <Button variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Deposit
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Account Balance"
          icon={<DollarSign />}
          value={`₦${wallet?.balance?.toLocaleString() || "0.00"}`}
          subtitle="Available for transactions"
        />
        <OverviewCard
          title="Account Number"
          icon={<CreditCard />}
          value={user?.account_number || "N/A"}
          subtitle="Your unique account ID"
        />
        <OverviewCard
          title="Beneficiaries"
          icon={<Users />}
          value={(user?.beneficiary?.length || 0).toString()}
          subtitle="Saved accounts"
        />
        <OverviewCard
          title="Profile Status"
          icon={<User />}
          value={user?.verified ? "Verified" : "Unverified"}
          subtitle="Account verification status"
        />
      </div>

      {/* Transactions & Beneficiaries */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            {wallet?.transactions && wallet.transactions.length > 0 ? (
              <TransactionList transactions={wallet.transactions.slice(0, 5)} />
            ) : (
              <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
            )}
            <div className="mt-4 text-right">
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Favorite Beneficiaries</CardTitle>
            <CardDescription>Quick access to your frequent contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteBeneficiaries.length > 0 ? (
              <div className="space-y-4">
                {favoriteBeneficiaries.slice(0, 5).map((ben: Beneficiary) => (
                  <div key={ben._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ben.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ben.bank} - {ben.account_number}
                      </p>
                    </div>
                    <Link href={`/dashboard/transfer/${ben._id}`}>
                      <Button size="sm" variant="outline">
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No favorite beneficiaries yet</p>
            )}
            <div className="mt-4 text-right">
              <Link href="/dashboard/beneficiaries">
                <Button variant="ghost" size="sm">
                  Manage beneficiaries
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OverviewCard({
  title,
  icon,
  value,
  subtitle,
}: {
  title: string
  icon: React.ReactNode
  value: string
  subtitle: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
