import Link from "next/link"
import { Button } from "../components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">SecureWallet</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-24 space-y-8">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Secure Digital Wallet with Advanced Protection</h2>
            <p className="text-xl text-muted-foreground">
              Experience banking-grade security with our intelligent risk-based authentication system that adapts to
              keep your money safe.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container py-12 space-y-8">
          <h3 className="text-2xl font-bold text-center">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border rounded-lg p-6 space-y-2">
              <h4 className="text-xl font-semibold">Smart Security</h4>
              <p className="text-muted-foreground">
                Our system adapts security measures based on risk assessment of each login attempt.
              </p>
            </div>
            <div className="border rounded-lg p-6 space-y-2">
              <h4 className="text-xl font-semibold">Easy Transfers</h4>
              <p className="text-muted-foreground">
                Send money to saved beneficiaries or any account with just a few clicks.
              </p>
            </div>
            <div className="border rounded-lg p-6 space-y-2">
              <h4 className="text-xl font-semibold">Transaction History</h4>
              <p className="text-muted-foreground">
                Keep track of all your financial activities with detailed transaction records.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex justify-center">
          <p className="text-sm text-muted-foreground">© 2024 SecureWallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
