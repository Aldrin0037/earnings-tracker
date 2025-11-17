import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Calculator, 
  FileBarChart, 
  Settings,
  ChevronRight,
  BarChart3,
  Calendar,
  Wallet
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-4">
              <DollarSign className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight">
            Earnings Tracker
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your daily earnings from bookings and inquiries. 
            Manage advances, generate reports, and stay on top of your income.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button size="lg" variant="outline">
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Daily Earnings Entry</h3>
            <p className="text-muted-foreground">
              Track base pay, bookings, and inquiry pay with automatic calculations
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="rounded-lg bg-green-100 p-3 w-fit">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Advance Management</h3>
            <p className="text-muted-foreground">
              Keep track of advance payments and remaining balance automatically
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="rounded-lg bg-blue-100 p-3 w-fit">
              <FileBarChart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Export Reports</h3>
            <p className="text-muted-foreground">
              Generate PNG or PDF reports of your daily earnings summary
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="rounded-lg bg-orange-100 p-3 w-fit">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold">Historical Records</h3>
            <p className="text-muted-foreground">
              View and filter your earnings history with date range selection
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="rounded-lg bg-purple-100 p-3 w-fit">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold">Summary Statistics</h3>
            <p className="text-muted-foreground">
              See total earnings, bookings, and advance usage at a glance
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="rounded-lg bg-gray-100 p-3 w-fit">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold">Customizable Settings</h3>
            <p className="text-muted-foreground">
              Configure base pay, per-booking rates, and advance balance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Navigation</h2>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/history">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>History</span>
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
