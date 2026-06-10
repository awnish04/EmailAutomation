/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"

interface DashboardChartsProps {
  recentCampaigns: any[]
  chartData: any[]
}

export function DashboardCharts({ recentCampaigns, chartData }: DashboardChartsProps) {
  // Fallback to empty array if chartData is not provided
  const data = chartData || []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* ── Chart ── */}
      <Card className="lg:col-span-2 border-gray-200/60 shadow-sm rounded-[20px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[17px] font-bold text-gray-900">Email Performance (Last 14 Days)</CardTitle>
          <CardDescription className="text-gray-500 font-medium">Daily aggregate of emails sent and opened.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  name="Sent"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSent)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="opened" 
                  name="Opened"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOpened)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Campaigns List ── */}
      <Card className="border-gray-200/60 shadow-sm rounded-[20px] flex flex-col">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[17px] font-bold text-gray-900">Recent Campaigns</CardTitle>
              <CardDescription className="text-gray-500 font-medium mt-1">Your latest email dispatches</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold">
              View All
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
          {recentCampaigns.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400 p-8">
              No campaigns yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                      <Mail className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-[180px]">{c.name}</p>
                      <p className="text-[11px] font-medium text-gray-500 mt-0.5">{c.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{c.totalSent}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Sent</p>
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
