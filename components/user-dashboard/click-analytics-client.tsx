"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MousePointerClick } from "lucide-react";

export function ClickAnalyticsClient({
  clickData,
  topLinks,
}: {
  clickData: { date: string; clicks: number }[];
  topLinks: { url: string; clicks: number }[];
}) {
  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card className="border-gray-200/60 shadow-sm rounded-[20px]">
        <CardHeader>
          <CardTitle className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
            <MousePointerClick className="size-5 text-blue-500" />
            Clicks Over Time
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium">Daily aggregate of link clicks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clickData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="clicks" 
                  name="Clicks"
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Links */}
      <Card className="border-gray-200/60 shadow-sm rounded-[20px]">
        <CardHeader>
          <CardTitle className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
            <ExternalLink className="size-5 text-emerald-500" />
            Top Clicked Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topLinks.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">No click data available yet.</div>
          ) : (
            <div className="space-y-4">
              {topLinks.map((link, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs shrink-0">
                      {i + 1}
                    </span>
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 dark:text-white truncate hover:underline">
                      {link.url}
                    </a>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-lg font-bold text-emerald-600">{link.clicks}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Clicks</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
