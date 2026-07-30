import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, gradient }) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#151f32] border border-slate-200 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all flex items-center justify-between hover-card-trigger">
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-sans tracking-tight">
          {value}
        </h3>
      </div>
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
