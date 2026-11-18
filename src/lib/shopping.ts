import { RECIPES } from '../data/recipes'

// Mots du catalogue qui servent au filtrage des allergies, pas aux courses.
const SKIP = new Set(['poisson', 'crustacés', 'fruits à coque', 'courge', 'épices', 'graines'])

export type ShoppingItem = { name: string; dishes: string[] }

/** Liste de courses prévisionnelle : ingrédients regroupés, avec les plats qui les utilisent. */
export function shoppingList(menus: Record<number | string, string[]>): ShoppingItem[] {
  const map = new Map<string, Set<string>>()
  for (const ids of Object.values(menus)) {
    for (const id of ids) {
      const r = RECIPES.find((x) => x.id === id)
      if (!r) continue
      for (const ing of r.ingredients) {
        if (SKIP.has(ing)) continue
        if (!map.has(ing)) map.set(ing, new Set())
        map.get(ing)!.add(r.name)
      }
    }
  }
  return [...map.entries()]
    .map(([name, dishes]) => ({ name: name[0].toUpperCase() + name.slice(1), dishes: [...dishes] }))
    .sort((a, b) => b.dishes.length - a.dishes.length || a.name.localeCompare(b.name, 'fr'))
}

export const shoppingText = (items: ShoppingItem[]) =>
  ['🛒 Liste de courses prévisionnelle', ...items.map((i) => `☐ ${i.name}${i.dishes.length > 1 ? ` (×${i.dishes.length} plats)` : ''}`)].join('\n')
