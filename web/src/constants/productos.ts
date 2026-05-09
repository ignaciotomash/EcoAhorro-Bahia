export const PRODUCTOS_MOCK = [
  { 
    id: 1, 
    nombre: "Leche Entera 1L", 
    marca: "La Serenísima", 
    categoria: "Lácteos",
    // Ordenamos los precios de menor a mayor en el mock
    imagen: "https://placehold.co/400x400/f3f4f6/6b7280?text=Leche+Entera", // URL de ejemplo
    precios: [
      { super: "Cooperativa", valor: 1150 },
      { super: "Vea", valor: 1280 },
      { super: "ChangoMás", valor: 1310 }
    ]
  },
  { 
    id: 2, 
    nombre: "Yerba Mate 1kg", 
    marca: "Playadito", 
    categoria: "Almacén",
    precios: [
      { super: "ChangoMás", valor: 3400 },
      { super: "Cooperativa", valor: 3650 },
      { super: "Vea", valor: 3800 }
    ]
  }
];