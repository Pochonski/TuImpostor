import { Category } from "../store/types.js";

export const defaultCategories: Category[] = [
  {
    id: "food",
    name: "Comida",
    words: ["Pizza", "Hamburguesa", "Tacos", "Sushi", "Pasta", "Ensalada", "Pollo", "Carne", "Pescado", "Arroz", "Frijoles", "Tortillas", "Queso", "Tomate", "Lechuga", "Cebolla", "Ajo", "Chile", "Limon", "Agua", "Refresco", "Cerveza", "Vino", "Postre", "Helado", "Chocolate", "Galletas", "Pan", "Mantequilla", "Huevo", "Leche", "Yogurt", "Fruta", "Manzana", "Plátano", "Naranja", "Fresa", "Uva", "Sandía", "Melón", "Papaya", "Mango", "Piña", "Coco", "Aguacate", "Palomitas", "Nachos", "Doritos", "Cheetos", "Papas", "Hotdog", "Sandwich", "Torta", "Tamal", "Pozole", "Menudo", "Burrito", "Quesadilla", "Tostada", "Chilaquiles"],
  },
  {
    id: "movies",
    name: "Películas",
    words: ["Popcorn", "Cine", "Película", "Actor", "Actriz", "Director", "Guión", "Banda Sonora", "Efectos Especiales", "Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción", "Romance", "Animación", "Superhéroe", "Villano", "Protagonista", "Secuela", "Presecuela", "Trailer", "Estreno", "Taquilla", "Oscar", "Premio", "Festival", "Hollywood", "Bollywood", "Cámara", "Micrófono", "Luces", "Escenario", "Set", "Producción", "Edición", "Montaje", "Doblaje", "Subtítulos", "3D", "IMAX", "Netflix", "Disney", "Marvel", "Star Wars", "Harry Potter", "Avatar", "Titanic", "Jurassic Park", "Los Vengadores", "Spider-Man", "Batman", "Superman"],
  },
  {
    id: "apps",
    name: "Apps",
    words: ["WhatsApp", "Instagram", "Facebook", "Twitter", "TikTok", "YouTube", "Netflix", "Spotify", "Amazon", "Uber", "Airbnb", "Google", "Gmail", "Maps", "Waze", "Zoom", "Teams", "Discord", "Telegram", "Snapchat", "Pinterest", "LinkedIn", "Tinder", "PayPal", "Duolingo", "Disney+", "HBO Max"],
  },
  {
    id: "animals",
    name: "Animales",
    words: ["Perro", "Gato", "León", "Tigre", "Elefante", "Jirafa", "Cebra", "Mono", "Gorila", "Chimpance", "Canguro", "Koala", "Panda", "Oso", "Lobo", "Zorro", "Mapache", "Ciervo", "Venado", "Conejo", "Liebre", "Ratón", "Rata", "Ardilla", "Hamster", "Cobayo", "Hurón", "Comadreja", "Nutria", "Castor", "Puercoespín", "Erizo", "Murciélago", "Marmota", "Tejón", "Lince", "Puma", "Leopardo", "Guepardo", "Jaguar", "Pantera", "Hiena", "Chacal", "Coyote", "Dingo", "Perro salvaje", "Caballo", "Poni", "Burro", "Mula", "Rinoceronte", "Hipopótamo", "Cocodrilo", "Aligator", "Caimán", "Serpiente", "Cobra", "Pitón", "Boa", "Víbora", "Tortuga", "Tortuga marina", "Iguana", "Camaleón", "Lagarto", "Dragón", "Salamandra"],
  },
];

export function ensureDefaultCategories(state: { categories: Category[] }) {
  if (!state.categories) state.categories = [];
  state.categories = getCategoriesWithDefaults(state.categories);
}

export function getCategoriesWithDefaults(currentCategories: Category[]): Category[] {
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

export function getCategoryById(state: { categories: Category[] }, id: string): Category | undefined {
  return state.categories.find((cat) => cat.id === id);
}
