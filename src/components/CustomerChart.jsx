import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const fmt = value =>
  new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md text-sm space-y-1">
      <p className="font-semibold text-base mb-2">{d.monthLabel}</p>

      <div className="grid grid-cols-2 gap-x-4">
        <span>Neukunden:</span>
        <span className="text-right font-semibold">{fmt(d.newCustomers)}</span>

        <span>Nachbesteller:</span>
        <span className="text-right font-semibold">{fmt(d.reorderCustomers)}</span>
      </div>

      <hr className="my-2" />

      <div className="grid grid-cols-2 gap-x-4">
        <span>Kunden aktiv:</span>
        <span className="text-right font-semibold">{fmt(d.activeCustomersTotal)}</span>

        <span>Verkaufseinheiten:</span>
        <span className="text-right font-semibold">{fmt(d.totalUnits)}</span>
      </div>
    </div>
  );
};

const CustomerChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey="month"
          type="category"
          padding={{ left: 0, right: 0 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />

        <Area
          type="monotone"
          dataKey="reorderCustomers"
          name="Nachbesteller"
          stroke="#F06449"
          fill="#F06449"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="newCustomers"
          name="Neukunden"
          stroke="#136F63"
          fill="#136F63"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomerChart;
