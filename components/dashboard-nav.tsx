"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreditCard, Home, LogOut, Menu, Send, Shield, User, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/transfer",
      label: "Send Money",
      icon: <Send className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/transfer",
    },
    {
      href: "/dashboard/beneficiaries",
      label: "Beneficiaries",
      icon: <Users className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/beneficiaries",
    },
    {
      href: "/dashboard/transactions",
      label: "Transactions",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/transactions",
    },
    {
      href: "/dashboard/security",
      label: "Security",
      icon: <Shield className="h-4 w-4 mr-2" />,
      active: pathname.startsWith("/dashboard/security"),
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <User className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/profile",
    },
  ]

  const NavLinks = () => (
    <>
      {routes.map((route) => (
        <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
          <Button variant={route.active ? "default" : "ghost"} className="w-full justify-start">
            {route.icon}
            {route.label}
          </Button>
        </Link>
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
        onClick={() => {
          logout()
          setOpen(false)
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </>
  )

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold">SecureWallet</h1>
          </Link>
        </div>

        {isMobile ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
                  <div className="space-y-1">
                    <NavLinks />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  route.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-500 hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
