// Configuración de Supabase - REEMPLAZAR CON TUS CREDENCIALES
const SUPABASE_URL = "https://tu-proyecto.supabase.co"; // URL de tu proyecto en Supabase
const SUPABASE_KEY = "tu-anon-key"; // Tu clave anon pública

let supabase = null;

if (typeof window.supabase !== 'undefined' && SUPABASE_URL.includes("supabase.co")) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const statusEl = document.getElementById('sync-status');

function setStatus(text, type = '') {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.display = 'flex';
    statusEl.className = `sync-status ${type}`;
}

export async function syncFromCloud(state) {
    if (!supabase) return;

    try {
        setStatus('Sincronizando...', 'syncing');

        // 1. Obtener categorías de la nube
        const { data: cloudCategories, error } = await supabase
            .from('categories')
            .select('id, name, words');

        if (error) throw error;

        if (cloudCategories && cloudCategories.length > 0) {
            // 2. Mezclar con locales
            cloudCategories.forEach(cloudCat => {
                const localCat = state.categories.find(c => c.id === cloudCat.id || c.name.toLowerCase() === cloudCat.name.toLowerCase());

                if (!localCat) {
                    // Si no existe localmente, añadirla
                    state.categories.push({
                        id: cloudCat.id,
                        name: cloudCat.name,
                        words: cloudCat.words || []
                    });
                } else {
                    // Si existe, mezclar palabras
                    const cloudWords = cloudCat.words || [];
                    const localWords = localCat.words || [];
                    const combined = [...new Set([...localWords, ...cloudWords])];
                    localCat.words = combined;
                }
            });
        }

        setStatus('Online', 'online');
        setTimeout(() => { if (statusEl) statusEl.style.opacity = '0'; }, 3000);
    } catch (err) {
        console.error('Error sincronizando desde la nube:', err);
        setStatus('Offline', 'error');
    }
}

export async function syncToCloud(category) {
    if (!supabase) return;

    try {
        // Intentar insertar o actualizar la categoría
        const { error } = await supabase
            .from('categories')
            .upsert({
                id: category.id,
                name: category.name,
                words: category.words,
                updated_at: new Date()
            }, { onConflict: 'id' });

        if (error) throw error;
    } catch (err) {
        console.warn('No se pudo guardar en la nube (modo offline):', err);
    }
}
