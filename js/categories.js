const DEFAULT_CATEGORIES = [
  { 
    id: "classic", 
    name: "Clásico", 
    words: [
      "Impostor", "Tripulación", "Sospecha", "Misión", "Sabotaje", "Emergencia", "Reparación", 
      "Ventilación", "Reactor", "Electricidad", "Oxígeno", "Navegación", "Comunicaciones", 
      "Escudos", "Motores", "Alarma", "Cámara", "Registro", "Votación", "Expulsión"
    ] 
  },
  { 
    id: "office", 
    name: "Oficina", 
    words: [
      "Reunión", "Café", "Correo", "Jefe", "Deadline", "Excel", "PowerPoint", "Impresora", 
      "Escritorio", "Silla", "Teléfono", "Agenda", "Reporte", "Cliente", "Proyecto", "Equipo", 
      "Vacaciones", "Nómina", "Contrato", "Presentación", "Spreadsheet", "Documento", "Fax"
    ] 
  },
  { 
    id: "travel", 
    name: "Viajes", 
    words: [
      "Avión", "Hotel", "Maleta", "Pasaporte", "Excursión", "Playa", "Montaña", "Museo", 
      "Restaurante", "Taxi", "Aeropuerto", "Equipaje", "Reserva", "Turista", "Guía", "Mapa", 
      "Cámara", "Souvenir", "Hotel", "Hostal", "Alojamiento", "Transporte", "Visado"
    ] 
  },
  { 
    id: "food", 
    name: "Comida", 
    words: [
      "Pizza", "Hamburguesa", "Tacos", "Sushi", "Pasta", "Ensalada", "Pollo", "Carne", "Pescado", 
      "Arroz", "Frijoles", "Tortillas", "Queso", "Tomate", "Lechuga", "Cebolla", "Ajo", "Chile", 
      "Limon", "Agua", "Refresco", "Cerveza", "Vino", "Postre", "Helado", "Chocolate", "Galletas", 
      "Pan", "Mantequilla", "Huevo", "Leche", "Queso", "Yogurt", "Fruta", "Manzana", "Plátano", 
      "Naranja", "Fresa", "Uva", "Sandía", "Melón", "Papaya", "Mango", "Piña", "Coco", "Aguacate", 
      "Palomitas", "Nachos", "Doritos", "Cheetos", "Papas", "Hotdog", "Sandwich", "Torta", 
      "Tamal", "Pozole", "Menudo", "Taco", "Burrito", "Quesadilla", "Tostada", "Chilaquiles"
    ] 
  },
  { 
    id: "movies", 
    name: "Películas", 
    words: [
      "Popcorn", "Cine", "Película", "Actor", "Actriz", "Director", "Guión", "Banda Sonora", 
      "Efectos Especiales", "Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción", "Romance", 
      "Animación", "Superhéroe", "Villano", "Protagonista", "Secuela", "Presecuela", "Trailer", 
      "Estreno", "Taquilla", "Oscar", "Premio", "Festival", "Hollywood", "Bollywood", "Cámara", 
      "Micrófono", "Luces", "Escenario", "Set", "Producción", "Edición", "Montaje", "Doblaje", 
      "Subtítulos", "3D", "IMAX", "Netflix", "Disney", "Marvel", "Star Wars", "Harry Potter", 
      "Avatar", "Titanic", "Jurassic Park", "Los Vengadores", "Spider-Man", "Batman", "Superman"
    ] 
  },
  { 
    id: "apps", 
    name: "Apps", 
    words: [
      "WhatsApp", "Instagram", "Facebook", "Twitter", "TikTok", "YouTube", "Netflix", "Spotify", 
      "Amazon", "Uber", "Airbnb", "Google", "Gmail", "Maps", "Waze", "Zoom", "Teams", "Slack", 
      "Discord", "Telegram", "Snapchat", "Pinterest", "LinkedIn", "Tinder", "Bumble", "PayPal", 
      "Venmo", "CashApp", "Robinhood", "Coinbase", "Duolingo", "Calm", "Headspace", "MyFitnessPal", 
      "Strava", "Nike Run Club", "Fitbit", "Garmin", "Apple Watch", "Samsung Health", "Ring", 
      "DoorDash", "Uber Eats", "Grubhub", "Postmates", "Instacart", "Shipt", "Target", "Walmart", 
      "Amazon Prime", "Hulu", "Disney+", "HBO Max", "Paramount+", "Peacock", "Apple TV+", "YouTube TV"
    ] 
  },
  { 
    id: "animals", 
    name: "Animales", 
    words: [
      "Perro", "Gato", "León", "Tigre", "Elefante", "Jirafa", "Cebra", "Mono", "Gorila", "Chimpance", 
      "Canguro", "Koala", "Panda", "Oso", "Lobo", "Zorro", "Mapache", "Ciervo", "Venado", "Conejo", 
      "Liebre", "Ratón", "Rata", "Ardilla", "Hamster", "Cobayo", "Hurón", "Comadreja", "Nutria", 
      "Castor", "Puercoespín", "Erizo", "Murciélago", "Marmota", "Tejón", "Lince", "Puma", 
      "Leopardo", "Guepardo", "Jaguar", "Pantera", "Hiena", "Chacal", "Coyote", "Dingo", "Zorro", 
      "Lobo", "Perro salvaje", "Caballo", "Poni", "Burro", "Mula", "Cebra", "Rinoceronte", 
      "Hipopótamo", "Cocodrilo", "Aligator", "Caimán", "Serpiente", "Cobra", "Pitón", "Boa", 
      "Víbora", "Tortuga", "Tortuga marina", "Iguana", "Camaleón", "Lagarto", "Dragón", "Salamandra"
    ] 
  }
];

export function getCategories(state) {
  return (state.categories ?? []).slice();
}

export function getCategoryById(state, id) {
  return (state.categories ?? []).find((c) => c.id === id) ?? null;
}

export function createCategory(state, name) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { ok: false, reason: "El nombre no puede estar vacío" };
  }
  const trimmed = name.trim();
  const exists = (state.categories ?? []).some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    return { ok: false, reason: "Ya existe una categoría con ese nombre" };
  }
  const newCategory = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: trimmed,
    words: [],
  };
  state.categories.push(newCategory);
  return { ok: true, category: newCategory };
}

export function deleteCategory(state, id) {
  const idx = (state.categories ?? []).findIndex((c) => c.id === id);
  if (idx === -1) return { ok: false, reason: "Categoría no encontrada" };
  const removed = state.categories.splice(idx, 1)[0];
  return { ok: true, category: removed };
}

export function addWord(state, categoryId, word) {
  if (!word || typeof word !== "string" || !word.trim()) {
    return { ok: false, reason: "La palabra no puede estar vacía" };
  }
  const trimmed = word.trim();
  const cat = getCategoryById(state, categoryId);
  if (!cat) return { ok: false, reason: "Categoría no encontrada" };
  const exists = cat.words.some((w) => w.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    return { ok: false, reason: "La palabra ya existe en esta categoría" };
  }
  cat.words.push(trimmed);
  return { ok: true, word: trimmed };
}

export function removeWord(state, categoryId, word) {
  const cat = getCategoryById(state, categoryId);
  if (!cat) return { ok: false, reason: "Categoría no encontrada" };
  const idx = cat.words.findIndex((w) => w.toLowerCase() === word.toLowerCase());
  if (idx === -1) return { ok: false, reason: "Palabra no encontrada" };
  const removed = cat.words.splice(idx, 1)[0];
  return { ok: true, word: removed };
}

export function ensureDefaultCategories(state) {
  if (!state.categories || state.categories.length === 0) {
    state.categories = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      id: c.id,
      words: c.words.slice(),
    }));
  } else {
    // Verificar si faltan categorías predeterminadas y agregarlas
    const existingIds = state.categories.map(c => c.id);
    const missingCategories = DEFAULT_CATEGORIES.filter(c => !existingIds.includes(c.id));
    
    if (missingCategories.length > 0) {
      console.log(`Agregando ${missingCategories.length} categorías faltantes:`, missingCategories.map(c => c.name));
      state.categories.push(...missingCategories.map((c) => ({
        ...c,
        id: c.id,
        words: c.words.slice(),
      })));
    }
    
    // Actualizar categorías existentes con nuevas palabras
    DEFAULT_CATEGORIES.forEach(defaultCat => {
      const existingCat = state.categories.find(c => c.id === defaultCat.id);
      if (existingCat) {
        // Agregar palabras que faltan
        const existingWords = existingCat.words.map(w => w.toLowerCase());
        const missingWords = defaultCat.words.filter(word => !existingWords.includes(word.toLowerCase()));
        
        if (missingWords.length > 0) {
          console.log(`Agregando ${missingWords.length} palabras a la categoría "${defaultCat.name}"`);
          existingCat.words.push(...missingWords);
        }
      }
    });
  }
}
