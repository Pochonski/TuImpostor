export const defaultCategories = [
  {
    id: "travel",
    name: "Viajes",
    words: ["Avión", "Hotel", "Maleta", "Pasaporte", "Excursión", "Playa", "Montaña", "Museo", "Restaurante", "Taxi", "Aeropuerto", "Equipaje", "Reserva", "Turista", "Guía", "Mapa", "Cámara", "Souvenir", "Hotel", "Hostal", "Alojamiento", "Transporte", "Visado"],
  },
  {
    id: "food",
    name: "Comida",
    words: ["Pizza", "Hamburguesa", "Tacos", "Sushi", "Pasta", "Ensalada", "Pollo", "Carne", "Pescado", "Arroz", "Frijoles", "Tortillas", "Queso", "Tomate", "Lechuga", "Cebolla", "Ajo", "Chile", "Limon", "Agua", "Refresco", "Cerveza", "Vino", "Postre", "Helado", "Chocolate", "Galletas", "Pan", "Mantequilla", "Huevo", "Leche", "Queso", "Yogurt", "Fruta", "Manzana", "Plátano", "Naranja", "Fresa", "Uva", "Sandía", "Melón", "Papaya", "Mango", "Piña", "Coco", "Aguacate", "Palomitas", "Nachos", "Doritos", "Cheetos", "Papas", "Hotdog", "Sandwich", "Torta", "Tamal", "Pozole", "Menudo", "Taco", "Burrito", "Quesadilla", "Tostada", "Chilaquiles"],
  },
  {
    id: "movies",
    name: "Películas",
    words: ["Popcorn", "Cine", "Película", "Actor", "Actriz", "Director", "Guión", "Banda Sonora", "Efectos Especiales", "Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción", "Romance", "Animación", "Superhéroe", "Villano", "Protagonista", "Secuela", "Presecuela", "Trailer", "Estreno", "Taquilla", "Oscar", "Premio", "Festival", "Hollywood", "Bollywood", "Cámara", "Micrófono", "Luces", "Escenario", "Set", "Producción", "Edición", "Montaje", "Doblaje", "Subtítulos", "3D", "IMAX", "Netflix", "Disney", "Marvel", "Star Wars", "Harry Potter", "Avatar", "Titanic", "Jurassic Park", "Los Vengadores", "Spider-Man", "Batman", "Superman"],
  },
  {
    id: "apps",
    name: "Apps",
    words: ["WhatsApp", "Instagram", "Facebook", "Twitter", "TikTok", "YouTube", "Netflix", "Spotify", "Amazon", "Uber", "Airbnb", "Google", "Gmail", "Maps", "Waze", "Zoom", "Teams", "Slack", "Discord", "Telegram", "Snapchat", "Pinterest", "LinkedIn", "Tinder", "Bumble", "PayPal", "Venmo", "CashApp", "Robinhood", "Coinbase", "Duolingo", "Calm", "Headspace", "MyFitnessPal", "Strava", "Nike Run Club", "Fitbit", "Garmin", "Apple Watch", "Samsung Health", "Ring", "DoorDash", "Uber Eats", "Grubhub", "Postmates", "Instacart", "Shipt", "Target", "Walmart", "Amazon Prime", "Hulu", "Disney+", "HBO Max", "Paramount+", "Peacock", "Apple TV+", "YouTube TV"],
  },
  {
    id: "animals",
    name: "Animales",
    words: ["Perro", "Gato", "León", "Tigre", "Elefante", "Jirafa", "Cebra", "Mono", "Gorila", "Chimpance", "Canguro", "Koala", "Panda", "Oso", "Lobo", "Zorro", "Mapache", "Ciervo", "Venado", "Conejo", "Liebre", "Ratón", "Rata", "Ardilla", "Hamster", "Cobayo", "Hurón", "Comadreja", "Nutria", "Castor", "Puercoespín", "Erizo", "Murciélago", "Marmota", "Tejón", "Lince", "Puma", "Leopardo", "Guepardo", "Jaguar", "Pantera", "Hiena", "Chacal", "Coyote", "Dingo", "Zorro", "Lobo", "Perro salvaje", "Caballo", "Poni", "Burro", "Mula", "Cebra", "Rinoceronte", "Hipopótamo", "Cocodrilo", "Aligator", "Caimán", "Serpiente", "Cobra", "Pitón", "Boa", "Víbora", "Tortuga", "Tortuga marina", "Iguana", "Camaleón", "Lagarto", "Dragón", "Salamandra"],
  },
];

export function ensureDefaultCategories(state) {
  if (!state.categories) state.categories = [];
  state.categories = getCategoriesWithDefaults(state.categories);
}

export function getCategoriesWithDefaults(currentCategories) {
  const newCats = [...(currentCategories || [])];
  defaultCategories.forEach((defaultCat) => {
    const existingIndex = newCats.findIndex(
      (c) => c.id === defaultCat.id || c.name.toLowerCase() === defaultCat.name.toLowerCase()
    );
    if (existingIndex === -1) {
      newCats.push({ ...defaultCat, words: [...defaultCat.words] });
    } else {
      const existing = newCats[existingIndex];
      if (existing.words.length < defaultCat.words.length) {
        newCats[existingIndex] = {
          ...existing,
          id: defaultCat.id,
          words: [...defaultCat.words]
        };
      }
    }
  });
  return newCats;
}

export function getCategoryById(state, id) {
  return state.categories.find((cat) => cat.id === id);
}
