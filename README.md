# TúImpostor 🕵️‍♂️

Un juego social multijugador donde debes descubrir quién es el impostor entre vosotros.

## 🎮 ¿Cómo jugar?

1. **Configura la partida**: Elige el número de jugadores e impostores
2. **Selecciona categorías**: Elige las categorías de palabras para la partida
3. **Reparte roles**: Cada jugador recibe su rol en secreto
4. **Juega**: Los jugadores intentan descubrir quiénes son los impostores
5. **Vota**: Al final, votan a quién creen que es el impostor

## ✨ Características

- 🎯 **Múltiples categorías**: Clásico, Oficina, Viajes, Comida y más
- 👥 **Jugadores personalizables**: Desde 3 jugadores en adelante
- 🎨 **Interfaz responsive**: Funciona en móviles y escritorio
- 💾 **Persistencia local**: Guarda tu progreso
- 🔄 **State management**: Arquitectura Redux-like para lógica pura
- 📱 **Multiplataforma**: Web y Android con Capacitor

## 🚀 Demo

Juega online: [https://pochonski.github.io/TuImpostor/](https://pochonski.github.io/TuImpostor/)

## 🛠️ Tecnología

- **Frontend**: JavaScript vanilla, HTML5, CSS3
- **Build Tool**: Vite
- **Arquitectura**: SPA con routing client-side, Redux-like state management (store, reducer, actions)
- **Mobile**: Capacitor para Android
- **Deploy**: GitHub Pages

## 📦 Instalación local

```bash
# Clona el repositorio
git clone https://github.com/Pochonski/TuImpostor.git
cd TuImpostor

# Instala dependencias
npm install

# Inicia servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## 📱 Desarrollo para Android

```bash
# Construye la app web
npm run build

# Sincroniza con Capacitor
npx cap sync android

# Abre en Android Studio
npx cap open android
```

Asegúrate de tener Android Studio instalado.

## 🎯 Ideal para

- Reuniones con amigos 👨‍👩‍👧‍👦
- Team building 🏢
- Fiestas y eventos sociales 🎉
- Actividades educativas 📚

## 📄 Licencia

MIT License - puedes usar este proyecto para lo que quieras.

---

**Hecho con ❤️ por [Pochonski](https://github.com/Pochonski)**
