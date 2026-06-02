'use client';

type Supermercado = { id: string; nombre: string };

type Props = {
  supermercados: Supermercado[];
  seleccionados: string[];
  onChange: (seleccionados: string[]) => void;
};

export default function FiltroSupermercados({ supermercados, seleccionados, onChange }: Props) {
  const toggle = (nombre: string) => {
    const yaSeleccionado = seleccionados.includes(nombre);

    // No permitir deseleccionar el último
    if (yaSeleccionado && seleccionados.length === 1) return;

    const nuevos = yaSeleccionado
      ? seleccionados.filter(s => s !== nombre)
      : [...seleccionados, nombre];

    onChange(nuevos);
  };

  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E5E7EB' }}>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Supermercados a considerar
      </p>
      <div className="flex flex-wrap gap-2">
        {supermercados.map(super_ => {
          const activo = seleccionados.includes(super_.nombre);
          return (
            <button
              key={super_.nombre}
              onClick={() => toggle(super_.nombre)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={activo
                ? { backgroundColor: '#1A237E', color: 'white', border: '1.5px solid #1A237E' }
                : { backgroundColor: 'white', color: '#9CA3AF', border: '1.5px solid #E5E7EB' }
              }
            >
              <span>{activo ? '✓' : '+'}</span>
              {super_.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}