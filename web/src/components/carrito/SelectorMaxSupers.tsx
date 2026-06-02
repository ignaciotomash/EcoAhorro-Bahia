'use client';

type Props = {
  maxDisponible: number;       // total de supermercados seleccionados en el filtro
  value: number | null;        // null = sin límite
  onChange: (value: number | null) => void;
};

export default function SelectorMaxSupers({ maxDisponible, value, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val === '' ? null : Number(val));
  };

  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E5E7EB' }}>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Máximo de supermercados a visitar
      </p>
      <select
        value={value ?? ''}
        onChange={handleChange}
        className="w-full rounded-xl px-3 py-2 text-sm font-semibold outline-none transition-all"
        style={{
          border: '1.5px solid #E5E7EB',
          color: value ? '#1A237E' : '#9CA3AF',
          backgroundColor: 'white',
          cursor: 'pointer',
        }}
      >
        <option value="">Cualquier cantidad</option>
        {Array.from({ length: maxDisponible }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>
            {n} {n === 1 ? 'supermercado' : 'supermercados'}
          </option>
        ))}
      </select>
    </div>
  );
}