import React, { useState, useEffect } from 'react';
import InputMask from './components/InputMask';
import LicenseChart from './components/LicenseChart';
import CustomerChart from './components/CustomerChart';
import CreativeChart from './components/CreativeChart';
import License2Chart from './components/License2Chart';

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full mb-6">
      <div className="max-w-screen-xl mx-auto px-4 border rounded-2xl bg-white">
       <button
  onClick={() => setOpen(!open)}
  className="w-full p-4 flex items-center justify-between font-semibold"
>
  <span>{title}</span>
  <span className="text-xl">{open ? '−' : '+'}</span>
</button>
        {open && <div className="p-6">{children}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({
    months: 120,
    startDate: '2025-07',
    costPrice: 6.9,
    sellPrice: 12.9,
    uvp: 19.9,
    salesCost: 1.5,
    logisticsCost: 0.5,
    unitsPerDisplay: 32,
    newPartners: 6,
    increaseInterval: 3,
    increaseAmount: 1,
    reorderRate: 75,
    reorderCycle: 4,
    license1Gross: 1.4,
    postcardCost: 0.1,
    graphicShare: 0.3,
    license2: 0.75,
    license2Threshold: 50,
    marginPerUnit: 0,
    deckungsbeitragPerUnit: 0
  });

  useEffect(() => {
    const { sellPrice, costPrice, salesCost, logisticsCost } = data;
    const margin = parseFloat((sellPrice - costPrice).toFixed(2));
    const deck = parseFloat((margin - salesCost - logisticsCost).toFixed(2));
    setData(d => ({ ...d, marginPerUnit: margin, deckungsbeitragPerUnit: deck }));
  }, [data.sellPrice, data.costPrice, data.salesCost, data.logisticsCost]);

  const {
    months,
    startDate,
    costPrice,
    sellPrice,
    salesCost,
    logisticsCost,
    unitsPerDisplay,
    newPartners,
    increaseInterval,
    increaseAmount,
    reorderRate,
    reorderCycle,
    license1Gross,
    postcardCost,
    graphicShare,
    license2,
    license2Threshold
  } = data;

  const [startYear, startMonth] = startDate.split('-').map(Number);

  const newPartnersPerMonth = Array.from(
    { length: months },
    (_, j) => newPartners + (increaseInterval > 0 ? Math.floor(j / increaseInterval) * increaseAmount : 0)
  );
// Berechnung: aktive Kunden im letzten Monat
const lastMonthIndex = months - 1;
let activeCustomersInLastMonth = 0;

for (let cohort = 0; cohort <= lastMonthIndex; cohort++) {
  const age = lastMonthIndex - cohort;
  let isActive = age === 0;
  if (!isActive && reorderCycle > 0 && age >= reorderCycle && age % reorderCycle === 0) {
    isActive = true;
  }
  if (isActive) {
    activeCustomersInLastMonth += newPartnersPerMonth[cohort];
  }
}

  // 1) Chart-Daten
  let activeTotal = 0;
  let lastMonthActiveTotal = 0;
  const chartData = newPartnersPerMonth.map((cSize, i) => {

    const yyyy = startYear + Math.floor((startMonth - 1 + i) / 12);
    const mm = ((startMonth - 1 + i) % 12) + 1;
    const monthLabel = `${String(mm).padStart(2, '0')}/${yyyy}`;

    const baseUnits = cSize * unitsPerDisplay;

let activeThisMonth = 0;
if (reorderCycle > 0 && reorderRate > 0) {
  activeThisMonth = Math.round(cSize * reorderRate / 100);
  activeTotal += activeThisMonth;
  if (i === lastMonthIndex) {
  lastMonthActiveTotal = activeTotal;
}
}

let reorderUnits = 0;
let reorderCustomers = 0;

for (let j = 0; j < i; j++) {
  const cohortMonthIndex = j;
  const reorderMonthIndex = cohortMonthIndex + reorderCycle;

  if (i === reorderMonthIndex || (i - reorderMonthIndex) % reorderCycle === 0) {
    const previousCohort = newPartnersPerMonth[j];
    reorderUnits += previousCohort * (reorderRate / 100) * unitsPerDisplay;
    reorderCustomers += Math.round(previousCohort * (reorderRate / 100));
  }
}

    const totalUnits = baseUnits + reorderUnits;
    const bruttoRohertrag = (sellPrice - costPrice) * totalUnits;
    const vertriebsKosten = salesCost * totalUnits;
    const logistikKosten = logisticsCost * totalUnits;
    const deckungsbeitragII = bruttoRohertrag - vertriebsKosten - logistikKosten;
    const net1 = Math.max(license1Gross - postcardCost - graphicShare, 0);
    const tier1 = net1 * totalUnits;
    const tier2 = activeTotal > license2Threshold ? license2 * totalUnits : 0
    const rest = deckungsbeitragII - tier1 - tier2;

    return {
      month: i + 1,
      monthLabel,
      newCustomers: cSize,
      reorderCustomers,
      bruttoRohertrag: Number(bruttoRohertrag.toFixed(2)),
      vertriebsKosten: Number(vertriebsKosten.toFixed(2)),
      logistikKosten: Number(logistikKosten.toFixed(2)),
      deckungsbeitragII: Number(deckungsbeitragII.toFixed(2)),
      tier1: Number(tier1.toFixed(2)),
      tier2: Number(tier2.toFixed(2)),
      restgewinn: Number(rest.toFixed(2)),
      totalUnits,
      activeCustomersTotal: activeTotal
    };
  });

  // 2) KPI – erstes Jahr
  const totalNew = newPartnersPerMonth.reduce((a, b) => a + b, 0);
  // Neukunden mit mindestens einer Nachbestellung zählen
const reorders = newPartnersPerMonth
  .map(size => Math.round(size * reorderRate / 100))
  .reduce((a, b) => a + b, 0);

  let totalUnitsFirstYear = 0;
  newPartnersPerMonth.forEach(cohortSize => {
    let ve = unitsPerDisplay;
    for (let m = 1; m <= 11; m++) {
      if (reorderCycle > 0 && m % reorderCycle === 0) {
        ve += (reorderRate / 100) * unitsPerDisplay;
      }
    }
    totalUnitsFirstYear += cohortSize * ve;
  });

  const avgUnitsFirstYear = totalNew > 0 ? totalUnitsFirstYear / totalNew : 0;
  const avgRevenueFirstYear = avgUnitsFirstYear * sellPrice;

  // 3) Gesamtübersicht
  const totalLicense1 = chartData.reduce((sum, r) => sum + r.tier1, 0);
  const totalLicense2 = chartData.reduce((sum, r) => sum + r.tier2, 0);
  const totalUnitsAll = chartData.reduce((sum, r) => sum + r.totalUnits, 0);
  const lastLicense1 = chartData[chartData.length - 1]?.tier1 || 0;
  const lastLicense2 = chartData[chartData.length - 1]?.tier2 || 0;
  const totalSalesCost = chartData.reduce((sum, r) => sum + r.vertriebsKosten, 0);
  const avgSalesCostPerMonth = totalSalesCost / months;
  const lastSalesCost = chartData[chartData.length - 1]?.vertriebsKosten || 0;
  const totalLogisticsCost = chartData.reduce((sum, r) => sum + r.logistikKosten, 0);
  const avgLogisticsCostPerMonth = totalLogisticsCost / months;
  const lastLogisticsCost = chartData[chartData.length - 1]?.logistikKosten || 0;
  const lastMonthData = chartData[chartData.length - 1] || {};
  const lastMonthNewCustomers = lastMonthData.newCustomers || 0;
  const lastMonthRevenue = (lastMonthData.totalUnits || 0) * sellPrice;
  const lastMonthUnits = lastMonthData.totalUnits || 0;

  // Export
  const handleExportAll = () => {
    const exportPayload = {
      inputs: data,
      kpis: {
  totalNew,
  reorders,
  avgUnitsFirstYear: Number(avgUnitsFirstYear.toFixed(2)),
  avgRevenueFirstYear: Number(avgRevenueFirstYear.toFixed(2)),
  totalUnitsAll,
  avgUnitsPerMonth: Number((totalUnitsAll / months).toFixed(2)),

  // Lizenz 1
  totalLicense1: Number(totalLicense1.toFixed(2)),
  avgLicense1PerMonth: Number((totalLicense1 / months).toFixed(2)),
  lastLicense1Month: Number(lastLicense1.toFixed(2)),

  // Lizenz 2
  totalLicense2: Number(totalLicense2.toFixed(2)),
  avgLicense2PerMonth: Number((totalLicense2 / months).toFixed(2)),
  lastLicense2Month: Number(lastLicense2.toFixed(2)),

  // Vertriebskosten
  totalSalesCost: Number(totalSalesCost.toFixed(2)),
  avgSalesCostPerMonth: Number(avgSalesCostPerMonth.toFixed(2)),
  lastSalesCost: Number(lastSalesCost.toFixed(2)),

  // Logistikkosten
  totalLogisticsCost: Number(totalLogisticsCost.toFixed(2)),
  avgLogisticsCostPerMonth: Number(avgLogisticsCostPerMonth.toFixed(2)),
  lastLogisticsCost: Number(lastLogisticsCost.toFixed(2))
},
      
      chartData
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planning_data_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fmt = v => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' €';
  const fmtNum = v => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  return (
    <div className="relative min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
  <div className="max-w-screen-xl mx-auto">
    <div className="max-w-screen-xl mx-auto mt-6 mb-6 px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <h1 className="text-3xl font-semibold">Business Case "Süße Grüße" v1.1</h1>
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Alle Daten exportieren (JSON)
    </button>
  </div>
</div>
      <CollapsibleSection title="Projektbeschreibung" forceOpen={allSectionsOpen}>
  <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
    <p>
      Danke für die Dokumente – mit ihnen ist das Konzept nun <strong>rundum vollständig</strong> und lässt sich <strong>professionell abschließen</strong>.
      Hier ist die <strong>abschließende, erweiterte Projektbeschreibung</strong>, jetzt mit Einbezug der Inhalte aus:
    </p>
    <ul>
      <li>📨 <strong>Musteranschreiben</strong> (<code>pina_suesse-gruesse_anschreiben-A4.pdf</code>)</li>
      <li>💶 <strong>Preisliste & Displaydetails</strong> (<code>pina_suesse-gruesse_preise-A4.pdf</code>)</li>
      <li>🏙️ <strong>Beispielmotive</strong> (<code>SG_Bad-Driburg_Varianten.pdf</code> – als Visualisierungsgrundlage)</li>
    </ul>

    <h1>📘 Gesamtkonzept: „Süße Grüße aus… [Stadtname]“</h1>

    <h2>1. 💡 Projektidee</h2>
    <p>
      „Süße Grüße aus…“ ist ein hochwertiges Geschenkprodukt mit regionalem Herz:
      12 handgefertigte Pralinen, stilvoll verpackt in einer wiederverwendbaren Magnetbox, kombiniert mit einer individuell illustrierten Stadtpostkarte.
    </p>
    <p>
      Diese Verbindung von <strong>Kulinarik und Lokalidentität</strong> schafft ein besonderes Erlebnis – ideal als Souvenir, Kundengeschenk oder Mitbringsel.
      Das Produkt ist konzipiert für den <strong>Einzelhandel (B2B)</strong> und den <strong>Onlinevertrieb (B2C)</strong>.
    </p>

    <h2>2. 🧩 Beteiligte & Zuständigkeiten</h2>
    <table>
      <thead>
        <tr><th>Partner</th><th>Aufgabenbereich</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Pina</strong> (Chocolaterie & Patisserie, Paderborn)</td><td>Projektleitung, Einkauf, Konfektion, Vertrieb, Händlerbetreuung, Versand</td></tr>
        <tr><td><strong>Peters Pralinen GmbH</strong> (Lippstadt)</td><td>Herstellung 12er-Pralinenboxen (weißes Etikett), alkoholfrei, royal sortiert</td></tr>
        <tr><td><strong>CHOOSE Hub UG</strong> (Delbrück)</td><td>Webshop, Marketing, Lizenzvergabe, CRM, Technik, Druckkoordination</td></tr>
        <tr><td><strong>Designbüro Andreas Eschrich</strong> (Lippstadt)</td><td>Illustration aller Stadtmotive im exklusiven Stil</td></tr>
      </tbody>
    </table>

    <h2>3. 🎁 Produktstruktur</h2>
    <ul>
      <li>Magnetverschlussbox mit 12 alkoholfreien Pralinen (125g)</li>
      <li>DIN A6 Postkarte: 5 Stadt-Wahrzeichen</li>
      <li>Verkaufseinheit: 32 Boxen inkl. PoS-Display</li>
      <li>Optional: Box ohne Pralinen für Fachgeschäfte</li>
    </ul>

    <h2>4. 💶 Preisstruktur & Konditionen</h2>
    <table>
      <thead><tr><th>Stufe</th><th>Netto-Preis</th><th>Details</th></tr></thead>
      <tbody>
        <tr><td>Einkauf Pina → Peters</td><td>6,90 €</td><td>12er-Box</td></tr>
        <tr><td>EK Händler → Pina</td><td>12,90 € (ab 32 Stk.)</td><td>inkl. Postkarte, Verpackung, Display</td></tr>
        <tr><td>UVP Endkund:innen</td><td>19,90 €</td><td>Geschenkwert</td></tr>
      </tbody>
    </table>
    <p><strong>Versand:</strong> 9,90 € unter 64 Stück, frachtfrei ab 64 Stück, Maxibrief: 2,90 €<br/>
    <strong>Mindestbestellmenge:</strong> 32 Boxen/Variante</p>

    <h2>5. ✏️ Postkartenmotiv & Designprinzip</h2>
    <ul>
      <li>Illustration von 5 Wahrzeichen pro Stadt</li>
      <li>DIN A6 quer, 4/4-farbig, Rückseite beschreibbar</li>
      <li>Schwarz-weißer Illustrationsstil</li>
    </ul>
    <p><strong>Designpaket durch CHOOSE Hub:</strong> Koordination, Rechte, Druck, PoS-Materialien</p>

    <h2>6. 🖨️ Postkarten-Druckvarianten & Preise</h2>
    <table>
      <thead><tr><th>Variante</th><th>Beschreibung</th><th>500 Stk.</th><th>€/Stk.</th></tr></thead>
      <tbody>
        <tr><td>🅰️ Soft-Feel</td><td>400g, Soft-Touch kaschiert</td><td>46,14 €</td><td>0,09 €</td></tr>
        <tr><td>🅱️ Mattfolie</td><td>400g, mattfolienkaschiert</td><td>35,61 €</td><td>0,07 €</td></tr>
        <tr><td>🅲 Chromo</td><td>330g Chromo-Sulfatkarton</td><td>33,94 €</td><td>0,07 €</td></tr>
        <tr><td>🅳 Offset</td><td>350g Offsetkarton, voll beschreibbar</td><td>31,67 €</td><td>0,07 €</td></tr>
      </tbody>
    </table>

    <h2>7. ⚖️ Lizenzen & Rechte</h2>
    <h3>Lizenz 1 – Stadtmotiv & Printdesign</h3>
    <ul>
      <li>Exklusive Nutzung je Stadt durch Pina</li>
      <li>Urheberrecht beim Illustrator (CHOOSE Hub verwaltet)</li>
      <li>Keine geschützten Inhalte (z. B. Wappen)</li>
    </ul>
    <table>
      <thead><tr><th>Leistung</th><th>Zahlung</th><th>Empfänger</th></tr></thead>
      <tbody>
        <tr><td>Motivpauschale</td><td>120 €/Stadt</td><td>CHOOSE Hub → Illustrator</td></tr>
        <tr><td>Lizenzgebühr pro Box</td><td>variabel</td><td>CHOOSE Hub → 25 % an Illustrator</td></tr>
      </tbody>
    </table>

    <h3>Lizenz 2 – Digitale Plattform & Shop</h3>
    <ul>
      <li>B2B/B2C-Shop, CRM, SEO, Ads, Portal, Hosting</li>
      <li>Keine Fixkosten – Lizenzgebühr pro Einheit</li>
      <li>Aktivierung ab definierter Schwelle</li>
    </ul>

    <h2>8. 📈 Zielgruppenanalyse</h2>
    <h3>🏪 Händler (B2B)</h3>
    <ul>
      <li>Souvenirshops, Feinkost, Concept Stores</li>
      <li>Museumsshops, Buchhandlungen</li>
    </ul>

    <h3>👥 Endkund:innen (B2C)</h3>
    <ul>
      <li>Tourist:innen, Heimatverbundene</li>
      <li>Geschenksuchende, Firmenkund:innen</li>
    </ul>

    <h3>📍 Fokusregionen</h3>
    <p>Städte mit 10.000–50.000 EW, stark touristisch & lokal geprägt.</p>

    <h2>9. 📦 Display & Verkaufsunterstützung</h2>
    <ul>
      <li>Großdisplay: 31×160×50 cm</li>
      <li>Thekendisplay: 20×18×17 cm</li>
      <li>Einmalige Vorkosten: 120 € inkl. Designpaket</li>
    </ul>

    <h2>🔚 Fazit: Skalierbares Editionsmodell</h2>
    <p>
      „Süße Grüße aus…“ ist ein emotionales Geschenkprodukt mit regionaler Identität,
      hochwertigem Design und klarer Editionslogik.
    </p>
    <ul>
      <li><strong>Händler:</strong> fertiges, margenträchtiges Konzept</li>
      <li><strong>Kund:innen:</strong> Geschenk mit Bezug und Genuss</li>
      <li><strong>Pina:</strong> effiziente, skalierbare Produktlinie</li>
      <li><strong>Partner:</strong> faire Beteiligung am Wachstum</li>
    </ul>
  </div>
</CollapsibleSection>

      <CollapsibleSection title="Basisdaten & Produktkalkulation">
        <InputMask data={data} onChange={setData} sections={['Basisdaten', 'Produktkalkulation']} />
      </CollapsibleSection>

      <CollapsibleSection title="Händlerwachstum & Bestellverhalten">
        <InputMask data={data} onChange={setData} sections={['Händlerwachstum', 'Bestellverhalten']} />
      </CollapsibleSection>

      <CollapsibleSection title="Vertriebs- & Logistikkosten (Pina)">
        <InputMask data={data} onChange={setData} sections={['Kostenplanung (Pina)']} />
      </CollapsibleSection>

      <CollapsibleSection title="Lizenzkosten 1 & 2 (C-Hub)">
        <InputMask
          data={data}
          onChange={setData}
          sections={[
            'Lizenz 1 / Städteserie (C-Hub)',
            'Lizenz 2 / Website & Shop (C-Hub)'
          ]}
        />
      </CollapsibleSection>

    <CollapsibleSection title="Kunden & Umsatz">
  <div className="max-w-screen-xl mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Kundenkarten */}
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(totalNew)}</p>
        <p className="text-sm text-gray-500">Summe aller Neukunden über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(reorders)}</p>
        <p className="text-sm text-gray-500">Kunden mit mindestens einer Nachbestellung im Zeitraum</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(activeCustomersInLastMonth)}</p>
        <p className="text-sm text-gray-500">Kunden mit Bestellungen im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Umsatzkarten */}
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(avgUnitsFirstYear)}</p>
        <p className="text-sm text-gray-500">Ø VE je Kunde pro Jahr</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(avgRevenueFirstYear)}</p>
        <p className="text-sm text-gray-500">Ø Umsatz je Kunde pro Jahr</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(lastMonthRevenue)}</p>
        <p className="text-sm text-gray-500">Umsatz im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
    </div>
  </div>
</CollapsibleSection>

<CollapsibleSection title="VE">
  <div className="max-w-screen-xl mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(totalUnitsAll)}</p>
        <p className="text-sm text-gray-500">Summe aller Verkaufseinheiten über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(totalUnitsAll / months)}</p>
        <p className="text-sm text-gray-500">Ø Verkaufseinheiten pro Monat über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmtNum(lastMonthUnits)}</p>
        <p className="text-sm text-gray-500">Einheiten im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
    </div>
  </div>
</CollapsibleSection>

<CollapsibleSection title="Vertrieb & Logistik">
  <div className="max-w-screen-xl mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(totalSalesCost)}</p>
        <p className="text-sm text-gray-500">Summe aller Vertriebskosten über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(avgSalesCostPerMonth)}</p>
        <p className="text-sm text-gray-500">Ø Vertriebskosten pro Monat über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(lastSalesCost)}</p>
        <p className="text-sm text-gray-500">Vertriebskosten im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(totalLogisticsCost)}</p>
        <p className="text-sm text-gray-500">Summe aller Logistikkosten über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(avgLogisticsCostPerMonth)}</p>
        <p className="text-sm text-gray-500">Ø Logistikkosten pro Monat über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(lastLogisticsCost)}</p>
        <p className="text-sm text-gray-500">Logistikkosten im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
    </div>
  </div>
</CollapsibleSection>

<CollapsibleSection title="Lizenzen">
  <div className="max-w-screen-xl mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense1)}</p>
        <p className="text-sm text-gray-500">Summe aller Lizenzkosten 1 über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense1 / months)}</p>
        <p className="text-sm text-gray-500">Ø Lizenzkosten 1 pro Monat über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(lastLicense1)}</p>
        <p className="text-sm text-gray-500">Lizenz 1 Erlös im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense2)}</p>
        <p className="text-sm text-gray-500">Summe aller Lizenzkosten 2 über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense2 / months)}</p>
        <p className="text-sm text-gray-500">Ø Lizenzkosten 2 pro Monat über {months} Monate</p>
      </div>
      <div className="p-4 bg-gray-100 rounded-xl text-center">
        <p className="mt-2 text-2xl font-semibold">{fmt(lastLicense2)}</p>
        <p className="text-sm text-gray-500">Lizenz 2 Erlös im letzten Monat ({chartData[chartData.length - 1]?.monthLabel})</p>
      </div>
    </div>
  </div>
</CollapsibleSection>

      <CollapsibleSection title="Gesamtübersicht">
        <LicenseChart
          data={chartData}
          startYear={startYear}
          startMonth={startMonth}
          dataKey="tier1"
          strokeColor="#34C759"
          name="Lizenz 1 Erlös"
          dataKey2="tier2"
          strokeColor2="#007AFF"
          name2="Lizenz 2 Erlös"
          dataKey3="deckungsbeitragII"
          strokeColor3="#FFD60A"
          name3="Deckungsbeitrag II"
          dataKey4="restgewinn"
          strokeColor4="#FF9500"
          name4="Restgewinn"
        />
           </CollapsibleSection>
<CollapsibleSection title="Kundenzuwachs">
  <CustomerChart data={chartData} />
</CollapsibleSection>
   <CollapsibleSection title="Lizenz 1">
  <CreativeChart
    data={chartData}
    license1Gross={license1Gross}
    postcardCost={postcardCost}
    graphicShare={graphicShare}
  />
</CollapsibleSection>
    <CollapsibleSection title="Lizenz 2">
  <License2Chart data={chartData} />
</CollapsibleSection>

  </div>
  </div>
  );
}
