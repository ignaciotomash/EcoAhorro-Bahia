type CatalogHeaderProps = {
  selectedCount: number;
  totalProductos: number;
  visibleProductos: number;
};

export default function CatalogHeader({ selectedCount, totalProductos, visibleProductos }: CatalogHeaderProps) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0D1554 0%, #1A237E 60%, #283593 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-10">
        <p className="text-[10px] md:text-sm font-medium mb-0.5" style={{ color: '#FFCBB5' }}>
          Eco Ahorro Bahia
        </p>
        <h1 className="text-lg md:text-4xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
          CATALOGO COMPLETO
        </h1>
        <p className="mt-0.5 text-[10px] md:text-sm text-blue-200">
          {selectedCount === 0
            ? `${totalProductos} productos disponibles`
            : `${visibleProductos} de ${totalProductos} filtrados`}
        </p>
      </div>
    </div>
  );
}
