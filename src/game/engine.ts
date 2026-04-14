export function pickRandomWord(categoriesArray: { id: string; words: string[] }[], categoryIds: string[]): string | null {
  const availableWords: string[] = [];
  for (const categoryId of categoryIds) {
    const cat = categoriesArray.find(c => c.id === categoryId);
    if (cat && cat.words) {
      availableWords.push(...cat.words);
    }
  }
  if (availableWords.length === 0) return null;
  return availableWords[Math.floor(Math.random() * availableWords.length)];
}

export function assignRoles(playerCount: number, impostorCount: number): ("impostor" | "normal")[] {
  const roles: ("impostor" | "normal")[] = [];
  for (let i = 0; i < impostorCount; i++) roles.push("impostor");
  for (let i = impostorCount; i < playerCount; i++) roles.push("normal");
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles;
}
