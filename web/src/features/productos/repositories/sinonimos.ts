const grupos: Record<string, string[]> = {
  // --- LÁCTEOS ---
  leche: ["leche", "lechita", "lacteo", "lácteo", "sachet", "larga vida", "tetrabrik"],
  "leche entera": ["leche entera", "entera"],
  "leche descremada": ["leche descremada", "leche light", "descremada", "descre"],
  yogurt: ["yogur", "yogurt", "iogurt", "yogurcito", "potecito"],
  queso: ["queso", "quesito", "quesos", "quesillo", "cremoso", "cuartirolo", "port salut", "rallado", "queso rayado", "reggianito", "mozzarella", "muzarela", "crema de queso", "tybo", "fontina"],
  manteca: ["manteca", "mantequita"],
  "crema de leche": ["crema de leche", "crema larga vida", "media crema"],

  // --- ACEITES ---
  aceite: ["aceite", "aceitito"],
  "aceite de girasol": ["girasol", "aceite de girasol"],
  "aceite de oliva": ["oliva", "aceite de oliva"],
  "aceite mezcla": ["aceite mezcla"],

  // --- SECOS ---
  pasta: ["fideos", "tallarines", "espaguetis", "spaghetti", "macarrones", "mostacholes", "ravioles", "ñoquis", "coditos", "fusilli", "tirabuzones", "capeletti", "sorrentinos", "fideitos", "moñitos", "guiseros", "canelones", "lasaña", "corbatitas", "penne", "rigatoni"],
  harina: ["harina", "harina de trigo", "leudante", "harina comun", "harina común"],
  "harina 000": ["000", "harina 000"],
  "harina 0000": ["0000", "harina 0000"],
  arroz: ["arroz", "arrocito", "largo fino", "doble carolina", "parboil", "yamaní"],
  lentejas: ["lentejas", "lenteja"],
  garbanzos: ["garbanzos", "garbanzo"],
  porotos: ["porotos", "poroto", "alubias", "pallares", "poroto negro"],

  // --- CARNICERÍA Y FIAMBRES ---
  carne: ["carne", "vacuno", "vaca", "picada", "carne picada", "asado", "bife", "peceto", "nalga", "cuadril", "paleta", "osobuco", "matambre", "vacio", "vacío", "tapa de asado", "costilla", "aguja"],
  pollo: ["pollo", "pollito", "suprema", "pata muslo", "pechuga", "alitas", "trozado", "bocaditos de pollo", "cuarto trasero", "cuarto delantero"],
  pavo: ["pavo", "pavita"],
  cerdo: ["cerdo", "chancho", "pechito", "bondiola", "carre", "codillo"],
  jamón: ["jamon", "jamón", "jamon cocido", "jamon crudo", "paleta", "paleta cocida", "lomito"],
  salchicha: ["salchicha", "salchichas", "pancho", "panchos", "viena", "salchichitas", "frankfurt"],
  chorizo: ["chori", "chorizo", "choris"],
  hamburguesa: ["hamburguesa", "burger", "medallon", "medallón", "paty", "pati", "medallita"],
  milanesa: ["milanesa", "milanesas", "mila", "milas", "milanesa de soja", "milanesas de soja", "mila de pollo", "mila de carne"],
  atún: ["atun", "atún", "caballa", "desmenuzado", "en lata", "en aceite", "al natural"],
  

  // --- VERDULERÍA ---
  manzana: ["manzana", "manzanas"],
  banana: ["banana", "bananas", "banano", "platano", "plátano"],
  naranja: ["naranja", "naranjas"],
  mandarina: ["mandarina", "mandarinas"],
  papa: ["papa", "papas", "papines", "papa negra", "papa blanca", "pre fritas", "bastones"],
  tomate: ["tomate", "tomates", "perita", "platense", "cherry"],
  cebolla: ["cebolla", "cebollas", "verdeo", "morada", "cebolla blanca"],
  ajo: ["ajo", "ajos"],
  zanahoria: ["zanahoria", "zanahorias"],
  lechuga: ["lechuga", "capuchina", "criolla", "lechuga morada"],
  espinaca: ["espinaca", "espinacas"],
  choclo: ["choclo", "maiz", "maíz", "choclito"],
  arvejas: ["arvejas", "arvejitas"],
  palta: ["palta", "paltas"],
  frutilla: ["frutilla", "frutillas", "fresa"],
  ananá: ["anana", "ananá"],
  durazno: ["durazno", "duraznos"],
  batata: ["batata", "batatas"],

  // --- BEBIDAS ---
  agua: ["agua", "aguita", "agua mineral", "agua sin gas", "bajo sodio"],
  soda: ["soda", "sifón", "sifon", "agua con gas", "sodita"],
  gaseosa: ["gaseosa", "gaseosita", "refresco", "soft"],
  "coca cola": ["coca", "coca cola", "cocucha", "coke", "coca zero", "coca light", "coca sin azucar"],
  pepsi: ["pepsi"],
  jugo: ["jugo", "jugito", "zumo", "jugo concentrado"],
  cerveza: ["cerveza", "birra", "birrita", "lager", "ipa", "rubia", "cerveza negra", "cerveza roja", "porron", "porrón"],
  vino: ["vino", "vino tinto", "vino blanco", "malbec", "vinito", "patero", "tetra", "frizze", "champagne", "espumante", "rosado", "rose", "rosé"],
  fernet: ["fernet", "branca"],
  yerba: ["yerba", "yerba mate", "mate", "yerbita"],
  energizante: ["energizante", "energética", "energetica", "red bull", "monster", "speed"],

  // --- LIMPIEZA ---
  lavandina: ["lavandina", "cloro", "blanqueador", "bañolin", "bañolín"],
  detergente: ["detergente", "lavavajillas"],
  jabón: ["jabon", "jabón", "jabón en polvo", "jabón líquido", "pan de jabon"],
  suavizante: ["suavizante"],
  esponja: ["esponja", "esponjita", "virulana", "esponja de acero"],

  // --- PERFUMERÍA / PERSONAL ---
  shampoo: ["shampoo", "champu", "champú", "shampu", "crema de enjuague"],
  acondicionador: ["acondicionador", "enjuague capilar"],
  desodorante: ["desodorante", "deo"],
  "papel higiénico": ["papel higienico", "papel higiénico", "papel de baño", "papel de bano", "higienico"],
  pañales: ["pañales", "panales"],
  "pasta dental": ["pasta dental", "dentifrico", "dentífrico", "crema dental"],
  "rollo de cocina": [ "rollo de cocina", "rollos de cocina", "servilleta de papel"],

  // --- KIOSCO / DESAYUNO ---
  galletitas: ["galletitas", "galletas", "masitas", "cookies", "bizcochitos", "bizcochos", "saladix", "criollitas"],
  alfajor: ["alfajor", "alfajores"],
  chocolate: ["chocolate", "chocolatada", "barra de chocolate", "chocolatito"],
  mermelada: ["mermelada", "dulce de frutilla", "dulce de durazno"],
  azúcar: ["azucar", "azúcar", "edulcorante"],
  sal: ["sal", "sal fina", "sal gruesa"],
  pimienta: ["pimienta"],
  café: ["cafe", "café", "cafecito", "instantaneo", "cafe molido", "cafe en grano"],
  té: ["te", "té", "manzanilla", "tilo", "boldo"],
  mayonesa: ["mayonesa", "mayo"],
  ketchup: ["ketchup"],
  mostaza: ["mostaza"],
  vinagre: ["vinagre"],
  caldo: ["caldo", "cubito"],
  "dulce de leche": ["dulce de leche", "ddl", "dulcecito", "repostero"],
  cereal: ["cereal", "granola", "copos", "corn flakes", "copitos"],
  avena: ["avena", "quaker"],
  helado: ["helado", "pote de helado", "palito", "vasito", "bombon helado"],
  snack: ["snack", "papitas", "papas fritas", "chips", "palitos", "nachos", "chizitos", "palitos salados", "mani", "maní", "krachitos"],
  facturas: ["facturas", "medialunas", "criollitos", "facturitas", "vigilantes", "churros", "torta frita", "berlinesa"],

  // --- ALMACÉN / OTROS ---
  aceitunas: ["aceitunas", "aceituna", "aceituna verde", "aceituna negra", "aceituna rellena"],
  conservas: ["conservas", "arvejas en lata", "choclo en lata", "palmitos", "champignones", "pickles"],
  pan: ["pan", "pan lactal", "lactal", "pan de molde", "pan rallado", "pan negro", "pan integral", "pan de campo", "pan árabe", "pebete"],
  tapas: ["tapas de empanada", "tapas de tarta", "discos de empanada"],
  condimentos: ["condimentos", "oregano", "orégano", "pimentón", "paprika", "comino", "laurel", "aji molido", "ají molido", "curry", "provenzal"],
  salsa: ["salsa", "salsa de tomate", "tomate triturado", "puré de tomate", "fileto", "napolitana"],
  "queso crema": ["queso crema", "casancrem", "finlandia"],
  huevos: ["huevo", "huevos", "maple", "media docena", "docena"],
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