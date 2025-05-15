import React from 'react';

export default function InputMask({ data, onChange, sections }) {
  const handleChange = (name, value) => {
    let v = name === 'startDate' ? value : parseFloat(value) || 0;
    onChange({ ...data, [name]: v });
  };

  const allFields = [
    { section: 'Basisdaten', items: [
        { label: 'Planungszeitraum (Monate)', name: 'months', type: 'slider', min: 12, max: 120, step: 12 },
        { label: 'Startdatum der Planung', name: 'startDate', type: 'month' },
      ] },
    { section: 'Produktkalkulation', items: [
        { label: 'Einkaufspreis Pina (€ je VE)', name: 'costPrice', type: 'slider', min: 0, max: 20, step: 0.1 },
        { label: 'Verkaufspreis Pina (€ je VE)', name: 'sellPrice', type: 'slider', min: 0, max: 20, step: 0.1 },
        { label: 'UVP (€ je VE)', name: 'uvp', type: 'slider', min: 0, max: 20, step: 0.1 },
        { label: 'Rohertrag Pina pro VE (€)', name: 'marginPerUnit', type: 'readOnly' },
      ] },
    { section: 'Händlerwachstum', items: [
        { label: 'Start-Neukunden/Monat', name: 'newPartners', type: 'slider', min: 0, max: 20, step: 1 },
        { label: 'Erhöhungszyklus (Monate)', name: 'increaseInterval', type: 'slider', min: 1, max: 24, step: 1 },
        { label: 'Erhöhung pro Zyklus (Neukunden)', name: 'increaseAmount', type: 'slider', min: 0, max: 20, step: 1 },
      ] },
    { section: 'Bestellverhalten', items: [
        { label: 'Nachbesteller-Quote (%)', name: 'reorderRate', type: 'slider', min: 0, max: 100, step: 5 },
        { label: 'Nachbestell-Rhythmus (Monate)', name: 'reorderCycle', type: 'slider', min: 1, max: 12, step: 1 },
      ] },
    { section: 'Kostenplanung (Pina)', items: [
        { label: 'Vertriebskosten je VE (€)', name: 'salesCost', type: 'slider', min: 0, max: 5, step: 0.1 },
        { label: 'Logistikkosten je VE (€)', name: 'logisticsCost', type: 'slider', min: 0, max: 5, step: 0.1 },
        { label: 'Deckungsbeitrag II pro VE (€)', name: 'deckungsbeitragPerUnit', type: 'readOnly' },
      ] },
    { section: 'Lizenz 1 / Städteserie (C-Hub)', items: [
        { label: 'Lizenz 1 Einheit (€)', name: 'license1Gross', type: 'slider', min: 0, max: 5, step: 0.01 },
        { label: 'Postkartendruck €/Stück', name: 'postcardCost', type: 'slider', min: 0, max: 0.25, step: 0.01 },
        { label: 'Grafik-Kosten/Einheit (€)', name: 'graphicShare', type: 'slider', min: 0, max: 1, step: 0.01 },
      ] },
    { section: 'Lizenz 2 / Website & Shop (C-Hub)', items: [
        { label: 'Lizenz 2 €/Einheit', name: 'license2', type: 'slider', min: 0, max: 5, step: 0.01 },
        { label: 'Schwelle Lizenz 2 (Händler)', name: 'license2Threshold', type: 'slider', min: 0, max: 200, step: 1 },
      ] },
  ];

  const fields = sections
    ? allFields.filter(g => sections.includes(g.section))
    : allFields;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto px-4">
      {fields.map((group, gi) => (
        <fieldset key={gi} className="p-4 border rounded-2xl bg-gray-50">
          <legend className="text-lg font-semibold mb-4 text-gray-800">
            {group.section}
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {group.items.map(item => (
              <div key={item.name} className="flex flex-col">
                <label
                  htmlFor={item.name}
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  {item.label}
                </label>

                {item.type === 'month' ? (
                  <input
                    id={item.name}
                    type="month"
                    value={data[item.name]}
                    onChange={e => handleChange(item.name, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 max-w-[250px]"
                  />
                ) : item.type === 'readOnly' ? (
                  <div className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded max-w-[250px]">
  {data[item.name].toFixed(2)} €
</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      id={item.name}
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={data[item.name]}
                      onChange={e => handleChange(item.name, e.target.value)}
                      className="w-full max-w-[200px] md:max-w-[250px]"
                    />
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {data[item.name]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
