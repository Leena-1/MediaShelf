import React, { useContext } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { ThemeContext } from '../context/ThemeContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-[#1a2336] border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg text-xs">
        <p className="font-semibold mb-1 text-slate-800 dark:text-gray-100">{label || payload[0].name}</p>
        <p className="text-blue-600 dark:text-purple-400 font-medium">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const StatsCharts = ({ data }) => {
  const { isDark } = useContext(ThemeContext);
  if (!data) return null;

  const { typeDistribution, genreDistribution, ratingDistribution } = data;
  const hasData = typeDistribution?.some(d => d.value > 0);
  const axisColor = isDark ? '#6b7280' : '#94a3b8';

  if (!hasData) {
    return (
      <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#151f32] shadow-sm">
        Add books or movies to see analytics charts here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Movies vs Books Donut */}
      <div className="p-6 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-gray-800/60 rounded-2xl shadow-sm">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-4">Movies vs Books</h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {typeDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={30} iconType="circle"
                formatter={(v) => <span className="text-xs text-slate-600 dark:text-gray-400">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Genre Distribution Bar */}
      <div className="p-6 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-gray-800/60 rounded-2xl shadow-sm">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-4">Genre Breakdown</h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genreDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {genreDistribution?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Rating Distribution Bar */}
      <div className="p-6 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-gray-800/60 rounded-2xl shadow-sm">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-4">Rating Distribution</h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="rating" tick={{ fill: axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;
