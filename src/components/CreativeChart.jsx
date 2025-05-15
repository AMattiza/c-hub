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

  const fmt = v =>
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(v);

  const brutto = d.totalUnits * d.license1Gross;
  const grafik = d.totalUnits * d.graphicShare;
  const postkarte = d.totalUnits * d.postcardCost;
  const netto = brutto - grafik - postkarte;

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
        <span>Lizenz 1 brutto:</span>
        <span className="text-right font-semibold">{fmt(brutto)} €</span>

        <span>− Grafikkosten:</span>
        <span className="text-right font-semibold">−{fmt(grafik)} €</span>

        <span>− Postkartenkosten:</span>
        <span className="text-right font-semibold">−{fmt(postkarte)} €</span>
      </div>

      <hr className="my-2" />

      <div className="grid grid-cols-2 gap-x-4 font-semibold">
        <span>Lizenz 1 netto:</span>
        <span className="text-right">{fmt(netto)} €</span>
      </div>
    </div>
  );
};

const CreativeChart = ({ data, license1Gross, postcardCost, graphicShare }) => {
  // Daten erweitern
  const chart = data.map(row => ({
    ...row,
    postkartenKosten: row.totalUnits * postcardCost,
    grafikKosten: row.totalUnits * graphicShare,
    license1Brutto: row.totalUnits * license1Gross,
    totalCustomers: row.newCustomers + row.reorderCustomers,
    postcardCost,
    graphicShare,
    license1Gross
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="month" type="category" />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />

        {/* Brutto-Lizenz als Basis-Fläche */}
        <Area
          type="monotone"
          dataKey="license1Brutto"
          name="Lizenz 1 brutto"
          stroke="#2D3142"
          fill="#2D3142"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="grafikKosten"
          name="Grafikkosten"
          stroke="#136F63"
          fill="#136F63"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="postkartenKosten"
          name="Postkartenkosten"
          stroke="#A0C1B9"
          fill="#A0C1B9"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CreativeChart;
