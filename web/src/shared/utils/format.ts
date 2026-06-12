export function formatearNombreCategoria(nombre: string): string {
  const texto = nombre.replace(/_/g, ' ');
  return texto.replace(/[a-zA-Záéíóúñ]/, letra => letra.toUpperCase());
}
