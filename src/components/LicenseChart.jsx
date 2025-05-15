import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  const fmtInt = value => new Intl.NumberFormat('de-DE').format(value);
  const fmtDec = value =>
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md text-sm space-y-1">
      <p className="font-semibold text-base mb-2">{d.monthLabel}</p>

      <div className="grid grid-cols-2 gap-x-4">
        <span>Kunden aktiv:</span>
        <span className="text-right font-semibold">{fmtInt(d.activeCustomersTotal)}</span>

        <span>Neukunden:</span>
        <span className="text-right font-semibold">{fmtInt(d.newCustomers)}</span>

        <span>Nachbesteller:</span>
        <span className="text-right font-semibold">{fmtInt(d.reorderCustomers)}</span>
      </div>

      <hr className="my-2" />

      <div className="grid grid-cols-2 gap-x-4">
        <span>Verkaufseinheiten:</span>
        <span className="text-right font-semibold">{fmtInt(d.totalUnits)}</span>
      </div>

      <hr className="my-2" />

      <div className="grid grid-cols-2 gap-x-4">
        <span>Rohertrag Pina:</span>
        <span className="text-right font-semibold">{fmtDec(d.bruttoRohertrag)} €</span>

        <span>Vertriebskosten:</span>
        <span className="text-right font-semibold">−{fmtDec(d.vertriebsKosten)} €</span>

        <span>Logistikkosten:</span>
        <span className="text-right font-semibold">−{fmtDec(d.logistikKosten)} €</span>
      </div>

      <hr className="my-2" />

     <div className="grid grid-cols-2 gap-x-4">
  <span>Deckungsbeitrag II:</span>
  <span className="text-right font-semibold">{fmtDec(d.deckungsbeitragII)} €</span>

  <span>Lizenzkosten 1:</span>
  <span className="text-right font-semibold">-{fmtDec(d.tier1)} €</span>

  <span>Lizenzkosten 2:</span>
  <span className="text-right font-semibold">-{fmtDec(d.tier2)} €</span>
</div>

      <hr className="my-2" />

      <div className="grid grid-cols-2 gap-x-4 font-semibold">
        <span>Restgewinn Pina:</span>
        <span className="text-right">{fmtDec(d.restgewinn)} €</span>
      </div>
    </div>
  );
};

const LicenseChart = ({
  data,
  dataKey = 'tier1',
  dataKey2 = 'tier2',
  dataKey3 = 'deckungsbeitragII',
  dataKey4 = 'restgewinn',
  name = 'Lizenz 1 Erlös',
  name2 = 'Lizenz 2 Erlös',
  name3 = 'Deckungsbeitrag II',
  name4 = 'Restgewinn'
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: -40, bottom: 5 }}>
        <XAxis dataKey="month" padding={{ left: 0, right: 0 }} />
        <YAxis tick={false} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" />
        <Line type="monotone" dataKey={dataKey} stroke="#2D3142" name={name} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey={dataKey2} stroke="#136F63" name={name2} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey={dataKey3} stroke="#A0C1B9" name={name3} dot={false} strokeWidth={3} />
        <Line type="monotone" dataKey={dataKey4} stroke="#F06449" name={name4} dot={false} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LicenseChart;
