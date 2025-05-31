import { formatDistanceToNow } from "date-fns"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface Transaction {
  _id: string
  amount: number
  t_type: "Credit" | "Debit"
  ben_number?: string
  description?: string
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-4 ${transaction.t_type === "Credit" ? "bg-green-100" : "bg-red-100"}`}>
              {transaction.t_type === "Credit" ? (
                <ArrowDownLeft className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {transaction.t_type === "Credit"
                  ? "Deposit"
                  : transaction.ben_number
                    ? `Transfer to ${transaction.ben_number}`
                    : "Withdrawal"}
              </p>
              <p className="text-sm text-muted-foreground">{transaction.description || "No description"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${transaction.t_type === "Credit" ? "text-green-600" : "text-red-600"}`}>
              {transaction.t_type === "Credit" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(transaction.date), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
