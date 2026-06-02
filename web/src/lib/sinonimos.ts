const grupos: Record<string, string[]> = {
  leche: ["leche", "lechita", "lacteo", "lácteo"],
  "leche entera": ["leche entera", "entera"],
  "leche descremada": ["leche descremada", "leche light", "descremada", "light"],
  yogurt: ["yogur", "yogurt", "iogurt"],
  queso: ["queso", "quesito", "quesos", "quesillo", "quesito untable"],
  manteca: ["manteca", "mantequilla"],
  "crema de leche": ["crema", "crema de leche", "nata"],

  aceite: ["aceite", "aceitito"],
  "aceite de girasol": ["girasol", "aceite de girasol"],
  "aceite de oliva": ["oliva", "aceite de oliva"],
  "aceite mezcla": ["mezcla", "aceite mezcla"],

  pasta: ["fideos", "pasta", "pastas", "tallarines", "espaguetis", "spaghetti", "macarrones", "mostacholes", "ravioles", "ñoquis", "coditos", "fusilli", "tirabuzones", "capeletti", "sorrentinos"],
  harina: ["harina", "harina de trigo"],
  "harina 000": ["000", "harina 000"],
  "harina 0000": ["0000", "harina 0000"],
  arroz: ["arroz", "arrocito"],
  lentejas: ["lentejas", "lenteja"],
  garbanzos: ["garbanzos", "garbanzo"],
  porotos: ["porotos", "poroto", "frijoles", "judias", "alubias"],

  carne: ["carne", "vacuno", "res"],
  pollo: ["pollo", "pollito", "suprema", "pata muslo", "pechuga", "alitas"],
  pavo: ["pavo", "pavita"],
  cerdo: ["cerdo", "chancho"],
  jamón: ["jamon", "jamón"],
  salchicha: ["salchicha", "pancho"],
  chorizo: ["chori", "chorizo"],
  hamburguesa: ["hamburguesa", "burger", "medallon", "medallón", "paty", "medallita"],
  milanesa: ["milanesa", "milanesas", "mila", "milanesa de soja", "milanesas de soja"],
  atún: ["atun", "atún"],

  manzana: ["manzana"],
  banana: ["banana", "banano", "platano", "plátano", "guineo"],
  naranja: ["naranja"],
  mandarina: ["mandarina"],
  papa: ["papa", "papas", "patata", "papines", "papa negra", "papa blanca"],
  tomate: ["tomate"],
  cebolla: ["cebolla"],
  ajo: ["ajo"],
  zanahoria: ["zanahoria"],
  lechuga: ["lechuga"],
  espinaca: ["espinaca"],
  choclo: ["choclo", "maiz", "maíz"],
  arvejas: ["arvejas", "guisantes"],

  agua: ["agua", "aguita"],
  gaseosa: ["gaseosa", "soda", "refresco", "bebida", "soft"],
  "coca cola": ["coca", "coca cola", "cocucha"],
  pepsi: ["pepsi"],
  jugo: ["jugo", "jugito", "zumo"],
  cerveza: ["cerveza", "birra", "lager", "ipa", "rubia"],
  vino: ["vino", "tinto", "blanco", "malbec"] ,

  lavandina: ["lavandina", "cloro", "blanqueador"],
  detergente: ["detergente"],
  jabón: ["jabon", "jabón"],
  suavizante: ["suavizante"],
  esponja: ["esponja"],

  shampoo: ["shampoo", "champu", "champú", "shampu"],
  acondicionador: ["acondicionador"],
  desodorante: ["desodorante", "deo"],
  "papel higiénico": ["papel higienico", "papel higiénico", "papel de baño", "papel de bano", "papel"],
  pañales: ["pañales", "panales"],
  "pasta dental": ["pasta dental", "dentifrico", "dentífrico"],

  galletitas: ["galletitas", "galletas", "masitas", "cookies"],
  alfajor: ["alfajor", "alfajores"],
  chocolate: ["chocolate"],
  mermelada: ["mermelada"],
  azúcar: ["azucar", "azúcar"],
  sal: ["sal"],
  pimienta: ["pimienta"],
  café: ["cafe", "café"],
  té: ["te", "té"],
  mayonesa: ["mayonesa", "mayo"],
  ketchup: ["ketchup", "catsup"],
  mostaza: ["mostaza"],
  vinagre: ["vinagre"],
  caldo: ["caldo", "cubito"],
  "dulce de leche": ["dulce de leche", "ddl"],
  cereal: ["cereal", "granola"],
  avena: ["avena", "oatmeal"],
  helado: ["helado"],
  snack: ["snack", "papitas", "papas fritas", "chips", "doritos", "palitos", "nachos"] ,
};

export const SINONIMOS: Record<string, string> = Object.entries(grupos).reduce(
  (acc, [canonico, aliases]) => {
    aliases.forEach((alias) => {
      acc[alias.toLowerCase()] = canonico;
    });

    return acc;
  },
  {} as Record<string, string>
);
