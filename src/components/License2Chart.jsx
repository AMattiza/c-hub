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

const fmtEuro = value =>
  new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' €';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md text-sm space-y-1">
      <p className="font-semibold text-base mb-2">{d.monthLabel}</p>

      <div className="grid grid-cols-2 gap-x-4">
        <span>Kunden aktiv:</span>
        <span className="text-right font-semibold">{fmt(d.activeCustomersTotal)}</span>

        <span>Neukunden:</span>
        <span className="text-right font-semibold">{fmt(d.newCustomers)}</span>

        <span>Nachbesteller:</span>
        <span className="text-right font-semibold">{fmt(d.reorderCustomers)}</span>

        <span>Verkaufseinheiten:</span>
        <span className="text-right font-semibold">{fmt(d.totalUnits)}</span>
      </div>

      <hr className="my-2" />

      <div className="grid grid-cols-2 gap-x-4">
        <span>Lizenz 2 pro Einheit:</span>
        <span className="text-right font-semibold">{fmtEuro(d.license2)}</span>

        <span>Lizenz 2 brutto:</span>
        <span className="text-right font-semibold">{fmtEuro(d.tier2)}</span>
      </div>
    </div>
  );
};

const License2Chart = ({ data }) => {
  const chart = data.map(row => ({
    ...row,
    license2: row.tier2 / row.totalUnits || 0 // effektiver Wert (oder 0 bei 0 Units)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="month" type="category" />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />

        <Area
          type="monotone"
          dataKey="tier2"
          name="Lizenz 2 brutto"
          stroke="#c4cbca"
          fill="#c4cbca"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default License2Chart;
