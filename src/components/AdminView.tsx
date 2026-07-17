import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Coins, 
  FileText, 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  UserCheck, 
  Smartphone, 
  Lock, 
  Unlock 
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  isGoogleUser: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string;
  unlockedSlots: string[];
}

interface AdminStats {
  totalResumesAnalyzed: number;
  totalVisits: number;
  totalRevenue: number;
}

interface AdminViewProps {
  sessionToken: string;
}

export function AdminView({ sessionToken }: AdminViewProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/stats", {
          headers: {
            "Authorization": `Bearer ${sessionToken}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load admin metrics.");
        }
        setUsers(data.users || []);
        setStats(data.stats || null);
      } catch (err: any) {
        console.error("Admin data fetch error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, [sessionToken, refreshTrigger]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-editorial-sub">Decrypting secure administrator channel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-none border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900 p-6 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" />
          <h3 className="font-serif font-bold italic text-base">Security Gate Block</h3>
        </div>
        <p className="text-xs text-editorial-text leading-relaxed font-serif italic">
          {error}
        </p>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-3.5 py-1.5 border border-rose-300 dark:border-rose-800 bg-white dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-mono text-[10px] uppercase font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
        >
          Retry Verification
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-editorial-border pb-4 gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold italic text-editorial-text">Secure Pilot Reach & Growth Center</h3>
          <p className="text-[10px] font-mono text-editorial-sub uppercase tracking-wider">Uncompromised Real-time System Telemetry & User Insights</p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="inline-flex items-center gap-1.5 self-start md:self-auto border border-editorial-border bg-editorial-tint px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-editorial-text transition-all hover:bg-editorial-bg"
        >
          <RefreshCw className="h-3 w-3" />
          Force Telemetry Refresh
        </button>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users registered */}
          <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-4 shadow-[4px_4px_0px_var(--color-editorial-border)] flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-editorial-sub tracking-wider block">Total User Signups</span>
              <span className="text-2xl font-serif font-extrabold italic text-editorial-text leading-tight">{users.length}</span>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Visits */}
          <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-4 shadow-[4px_4px_0px_var(--color-editorial-border)] flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-editorial-sub tracking-wider block">Est. Page Visits (Reach)</span>
              <span className="text-2xl font-serif font-extrabold italic text-editorial-text leading-tight">{stats.totalVisits}</span>
            </div>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-sky-700 dark:text-sky-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Resumes Analyzed */}
          <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-4 shadow-[4px_4px_0px_var(--color-editorial-border)] flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-editorial-sub tracking-wider block">Resumes Critiqued</span>
              <span className="text-2xl font-serif font-extrabold italic text-editorial-text leading-tight">{stats.totalResumesAnalyzed}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Estimated revenue */}
          <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-4 shadow-[4px_4px_0px_var(--color-editorial-border)] flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-editorial-sub tracking-wider block">Gross Sales (₹100 INR / Slot)</span>
              <span className="text-2xl font-serif font-extrabold italic text-editorial-text leading-tight">₹{stats.totalRevenue} INR</span>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400">
              <Coins className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* User Accounts Management & Filter */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-editorial-border">
          <div>
            <h4 className="font-serif text-sm font-bold italic text-editorial-text">Secure Registered User Ledger</h4>
            <p className="text-[8px] font-mono uppercase text-editorial-sub tracking-widest">Manage credentials, view account creations and active unlocks</p>
          </div>

          {/* Search input */}
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-editorial-sub">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search user or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg pl-9 pr-3 py-1.5 text-xs font-mono tracking-wide text-editorial-text focus:outline-none placeholder:text-editorial-sub/60"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto border border-editorial-border">
          <table className="min-w-full divide-y divide-editorial-border text-left">
            <thead className="bg-editorial-tint/50 font-mono text-[9px] uppercase tracking-wider text-editorial-text">
              <tr>
                <th scope="col" className="px-4 py-3">User Details</th>
                <th scope="col" className="px-4 py-3">Account Type</th>
                <th scope="col" className="px-4 py-3">Joined Date</th>
                <th scope="col" className="px-4 py-3">Last Active</th>
                <th scope="col" className="px-4 py-3 text-center">Unlocked Slots</th>
                <th scope="col" className="px-4 py-3 text-right">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-border bg-white dark:bg-editorial-tint/10 font-serif italic text-xs text-editorial-text">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-editorial-sub font-mono uppercase text-[10px] tracking-widest">
                    No matching user credentials found in ledger.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-editorial-tint/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-editorial-text font-serif leading-snug">{user.username}</span>
                        <span className="font-mono not-italic text-[10px] text-editorial-sub lowercase mt-0.5 select-all">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono not-italic text-[10px] uppercase">
                      {user.isGoogleUser ? (
                        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 px-1.5 py-0.5">
                          <UserCheck className="h-3 w-3" />
                          Google OAuth
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 px-1.5 py-0.5">
                          Email/Password
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono not-italic text-editorial-sub">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono not-italic text-editorial-sub">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-[10px] not-italic text-editorial-text">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{user.unlockedSlots.length}</span>
                        <span className="text-[9px] text-editorial-sub uppercase tracking-wider font-bold">Unlocks</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono not-italic text-[10px] uppercase font-bold">
                      {user.isAdmin ? (
                        <span className="rounded-none bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 px-2 py-0.5">
                          Super Admin
                        </span>
                      ) : (
                        <span className="rounded-none bg-neutral-100 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-800 text-editorial-sub px-2 py-0.5">
                          Customer
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
