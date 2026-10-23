export type Diet = 'vege' | 'vegan' | 'sansPorc' | 'sansGluten' | 'sansLactose' | 'pesco'
export type Cuisine = 'francaise' | 'mediterraneenne' | 'orientale' | 'asiatique' | 'italienne' | 'indienne'
export type Equipment = 'four' | 'micro' | 'friteuse' | 'plaques' | 'airfryer' | 'mixer' | 'thermomix'

export const DIETS: { id: Diet; label: string; short: string; emoji: string }[] = [
  { id: 'vege', label: 'Végétarien', short: 'Végé', emoji: '🥕' },
  { id: 'vegan', label: 'Végétalien / Vegan', short: 'Vegan', emoji: '🌱' },
  { id: 'sansPorc', label: 'Sans porc', short: 'Sans porc', emoji: '🚫' },
  { id: 'sansGluten', label: 'Sans gluten', short: 'Sans gluten', emoji: '🌾' },
  { id: 'sansLactose', label: 'Sans produit laitier', short: 'Sans lactose', emoji: '🥛' },
  { id: 'pesco', label: 'Pesco-végétarien', short: 'Pesco', emoji: '🐟' },
]

export const CUISINES: { id: Cuisine; label: string; emoji: string }[] = [
  { id: 'francaise', label: 'Française', emoji: '🥖' },
  { id: 'mediterraneenne', label: 'Méditerranéenne', emoji: '🫒' },
  { id: 'orientale', label: 'Orientale', emoji: '🧆' },
  { id: 'asiatique', label: 'Asiatique', emoji: '🥢' },
  { id: 'italienne', label: 'Italienne', emoji: '🍝' },
  { id: 'indienne', label: 'Indienne', emoji: '🍛' },
]

export const EQUIPMENTS: { id: Equipment; label: string; emoji: string }[] = [
  { id: 'four', label: 'Four', emoji: '♨️' },
  { id: 'micro', label: 'Micro-onde', emoji: '📡' },
  { id: 'friteuse', label: 'Friteuse', emoji: '🍟' },
  { id: 'plaques', label: 'Plaques de cuisson', emoji: '🔥' },
  { id: 'airfryer', label: 'Airfryer', emoji: '🌀' },
  { id: 'mixer', label: 'Mixer', emoji: '🥤' },
  { id: 'thermomix', label: 'Thermomix', emoji: '🤖' },
]

export type Recipe = {
  id: string
  name: string
  tag: string
  img: string
  cuisine: Cuisine
  diets: Diet[]
  needs: Equipment[]
  ingredients: string[]
  kids?: boolean
  minutes: number
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`

/** Même photo en plus petit (Unsplash redimensionne à la volée). */
export const thumb = (url: string, w: number) => url.replace('w=800', `w=${w}`)
export const srcSet = (url: string) => `${thumb(url, 400)} 400w, ${thumb(url, 800)} 800w, ${thumb(url, 1200)} 1200w`

export const RECIPES: Recipe[] = [
  {
    id: 'lasagnes', name: 'Lasagnes signature, salade verte', tag: 'Réconfortant', img: u('1574894709920-11b28e7367e3'),
    cuisine: 'italienne', diets: ['sansPorc'], needs: ['four'], ingredients: ['bœuf', 'tomate', 'pâtes', 'fromage', 'lait'], kids: true, minutes: 25,
  },
  {
    id: 'curry-poulet', name: 'Curry de poulet & légumes, riz basmati', tag: 'Parfumé', img: u('1585937421612-70a008356fbe'),
    cuisine: 'indienne', diets: ['sansPorc', 'sansGluten', 'sansLactose'], needs: ['plaques'], ingredients: ['poulet', 'lait de coco', 'riz', 'curry'], minutes: 20,
  },
  {
    id: 'kefta', name: 'Tajine de kefta à la tomate & œufs', tag: 'Fait maison', img: u('1596797038530-2c107229654b'),
    cuisine: 'orientale', diets: ['sansPorc', 'sansGluten', 'sansLactose'], needs: ['plaques'], ingredients: ['bœuf', 'tomate', 'œuf', 'cumin'], minutes: 15,
  },
  {
    id: 'chorba', name: 'Chorba frik à l’agneau', tag: 'Tradition', img: u('1534939561126-855b8675edd7'),
    cuisine: 'orientale', diets: ['sansPorc', 'sansLactose'], needs: ['plaques'], ingredients: ['agneau', 'tomate', 'blé', 'pois chiches', 'coriandre'], minutes: 10,
  },
  {
    id: 'saumon', name: 'Pavé de saumon, légumes croquants', tag: 'Léger', img: u('1467003909585-2f8a72700288'),
    cuisine: 'francaise', diets: ['sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['four'], ingredients: ['saumon', 'poisson', 'courgette', 'citron'], minutes: 10,
  },
  {
    id: 'poke', name: 'Poké bowl saumon & avocat', tag: 'Frais', img: u('1546069901-ba9599a7e63c'),
    cuisine: 'asiatique', diets: ['sansPorc', 'sansLactose', 'pesco'], needs: [], ingredients: ['saumon', 'poisson', 'riz', 'avocat', 'soja', 'sésame'], minutes: 5,
  },
  {
    id: 'curry-crevettes', name: 'Curry de crevettes au lait de coco', tag: 'Exotique', img: u('1559847844-5315695dadae'),
    cuisine: 'asiatique', diets: ['sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['crevettes', 'crustacés', 'lait de coco', 'riz'], minutes: 10,
  },
  {
    id: 'spaghetti-crevettes', name: 'Spaghetti aux crevettes & tomates cerises', tag: 'Soleil', img: u('1563379926898-05f4575a45d8'),
    cuisine: 'italienne', diets: ['sansPorc', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['crevettes', 'crustacés', 'pâtes', 'tomate', 'ail'], minutes: 10,
  },
  {
    id: 'shakshuka', name: 'Chakchouka aux poivrons & œufs', tag: 'Végé', img: u('1590412200988-a436970781fa'),
    cuisine: 'orientale', diets: ['vege', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['œuf', 'poivron', 'tomate'], minutes: 10,
  },
  {
    id: 'tagliatelles', name: 'Tagliatelles crémeuses aux champignons', tag: 'Végé', img: u('1551183053-bf91a1d81141'),
    cuisine: 'italienne', diets: ['vege', 'sansPorc', 'pesco'], needs: ['plaques'], ingredients: ['pâtes', 'champignons', 'crème', 'lait', 'fromage'], kids: true, minutes: 10,
  },
  {
    id: 'penne', name: 'Penne all’arrabbiata', tag: 'Vegan', img: u('1621996346565-e3dbc646d9a9'),
    cuisine: 'italienne', diets: ['vege', 'vegan', 'sansPorc', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['pâtes', 'tomate', 'piment', 'ail'], minutes: 10,
  },
  {
    id: 'bowl-pois-chiches', name: 'Bowl pois chiches rôtis & avocat', tag: 'De saison', img: u('1512621776951-a57141f2eefd'),
    cuisine: 'mediterraneenne', diets: ['vege', 'vegan', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['four'], ingredients: ['pois chiches', 'avocat', 'chou', 'tomate'], minutes: 5,
  },
  {
    id: 'bowl-quinoa', name: 'Bowl quinoa, haricots verts & tomates', tag: 'Équilibré', img: u('1547592180-85f173990554'),
    cuisine: 'mediterraneenne', diets: ['vege', 'vegan', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['quinoa', 'haricots verts', 'tomate'], minutes: 5,
  },
  {
    id: 'veloute', name: 'Velouté de butternut, graines torréfiées', tag: 'De saison', img: u('1476718406336-bb5a9690ee2a'),
    cuisine: 'francaise', diets: ['vege', 'vegan', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['plaques', 'mixer'], ingredients: ['butternut', 'courge', 'oignon', 'graines'], kids: true, minutes: 8,
  },
  {
    id: 'salade-grenade', name: 'Salade d’épinards, grenade & patate douce', tag: 'Vitaminé', img: u('1511690743698-d9d85f2fbf38'),
    cuisine: 'mediterraneenne', diets: ['vege', 'vegan', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['four'], ingredients: ['épinards', 'grenade', 'patate douce'], minutes: 5,
  },
  {
    id: 'salade-pates', name: 'Salade de farfalle au pesto', tag: 'Végé', img: u('1473093295043-cdd812d0e601'),
    cuisine: 'italienne', diets: ['vege', 'sansPorc', 'pesco'], needs: ['plaques'], ingredients: ['pâtes', 'basilic', 'parmesan', 'fromage', 'pignons', 'fruits à coque'], kids: true, minutes: 5,
  },
  {
    id: 'boulettes', name: 'Boulettes de bœuf maison, roquette', tag: 'Super kids', img: u('1529042410759-befb1204b468'),
    cuisine: 'francaise', diets: ['sansPorc', 'sansLactose'], needs: ['plaques'], ingredients: ['bœuf', 'œuf', 'chapelure', 'oignon'], kids: true, minutes: 12,
  },
  {
    id: 'poulet-grille', name: 'Poulet grillé, petits pois-carottes', tag: 'Super kids', img: u('1598515214211-89d3c73ae83b'),
    cuisine: 'francaise', diets: ['sansPorc', 'sansGluten', 'sansLactose'], needs: ['plaques'], ingredients: ['poulet', 'petits pois', 'carottes'], kids: true, minutes: 10,
  },
  {
    id: 'poulet-croustillant', name: 'Poulet croustillant, coleslaw maison', tag: 'Super kids', img: u('1626082927389-6cd097cdc6ec'),
    cuisine: 'francaise', diets: ['sansPorc'], needs: ['four'], ingredients: ['poulet', 'chapelure', 'œuf', 'chou', 'mayonnaise'], kids: true, minutes: 15,
  },
  {
    id: 'tikka', name: 'Poulet tikka masala & naan', tag: 'Parfumé', img: u('1565557623262-b51c2513a641'),
    cuisine: 'indienne', diets: ['sansPorc'], needs: ['plaques', 'four'], ingredients: ['poulet', 'yaourt', 'lait', 'tomate', 'farine'], minutes: 15,
  },
  {
    id: 'korma', name: 'Korma de poulet doux, riz safrané', tag: 'Doux', img: u('1588166524941-3bf61a9c41db'),
    cuisine: 'indienne', diets: ['sansPorc', 'sansGluten'], needs: ['plaques'], ingredients: ['poulet', 'crème', 'lait', 'amandes', 'fruits à coque', 'riz'], kids: true, minutes: 15,
  },
  {
    id: 'riz-poulet', name: 'Pilons de poulet & riz à la tomate', tag: 'Généreux', img: u('1631515243349-e0cb75fb8d3a'),
    cuisine: 'orientale', diets: ['sansPorc', 'sansGluten', 'sansLactose'], needs: ['four', 'plaques'], ingredients: ['poulet', 'riz', 'tomate', 'épices'], kids: true, minutes: 15,
  },
  {
    id: 'poelee-poulet', name: 'Poêlée de poulet, tomates & basilic', tag: 'Rapide', img: u('1604908176997-125f25cc6f3d'),
    cuisine: 'mediterraneenne', diets: ['sansPorc', 'sansGluten', 'sansLactose'], needs: ['plaques'], ingredients: ['poulet', 'tomate', 'basilic', 'ail'], minutes: 8,
  },
  {
    id: 'riz-saute', name: 'Riz sauté aux légumes & œuf', tag: 'Végé', img: u('1603133872878-684f208fb84b'),
    cuisine: 'asiatique', diets: ['vege', 'sansPorc', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['riz', 'œuf', 'soja', 'carottes', 'petits pois'], kids: true, minutes: 8,
  },
  {
    id: 'soupe-legumes', name: 'Soupe paysanne aux légumes', tag: 'Réconfortant', img: u('1603105037880-880cd4edfb0d'),
    cuisine: 'francaise', diets: ['vege', 'vegan', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['carottes', 'poireaux', 'pommes de terre', 'céleri'], minutes: 8,
  },
  {
    id: 'pizza', name: 'Pizza maison légumes grillés & mozzarella', tag: 'Soirée pizza', img: u('1513104890138-7c749659a591'),
    cuisine: 'italienne', diets: ['vege', 'sansPorc', 'pesco'], needs: ['four'], ingredients: ['farine', 'tomate', 'mozzarella', 'fromage', 'lait', 'poivron'], kids: true, minutes: 12,
  },
  {
    id: 'salade-grecque', name: 'Salade grecque, feta & pita', tag: 'Fraîcheur', img: u('1505253716362-afaea1d3d1af'),
    cuisine: 'mediterraneenne', diets: ['vege', 'sansPorc', 'pesco'], needs: [], ingredients: ['feta', 'fromage', 'lait', 'concombre', 'tomate', 'olives', 'farine'], minutes: 5,
  },
  {
    id: 'bowl-oeuf', name: 'Bowl vert, œuf mollet & radis', tag: 'Healthy', img: u('1490645935967-10de6ba17061'),
    cuisine: 'francaise', diets: ['vege', 'sansPorc', 'sansGluten', 'sansLactose', 'pesco'], needs: ['plaques'], ingredients: ['œuf', 'épinards', 'radis', 'quinoa'], minutes: 5,
  },
]

export const SNACKS = [
  { name: 'Cookies aux pépites de chocolat', img: u('1558961363-fa8fdf82db35') },
  { name: 'Pain perdu, fruits rouges & banane', img: u('1484723091739-30a097e8f929') },
  { name: 'Tiramisu maison', img: u('1571877227200-a0d98ea607e9') },
]

export const IMAGES = {
  hero: u('1556910103-1c02745aae4d'),
  chef: u('1577219491135-ce391730fb2c'),
  kitchen: u('1556911220-bff31c812dba'),
  groceries: u('1606787366850-de6330128bfc'),
  spread: u('1504674900247-0877df9cc836'),
  table: u('1540189549336-e6e99c3679fe'),
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Une recette est compatible si elle respecte tous les régimes choisis,
 *  n'utilise que l'équipement disponible et évite les ingrédients listés. */
export function isCompatible(r: Recipe, diets: Diet[], avoid: string[], equipment: Equipment[]) {
  if (!diets.every((d) => r.diets.includes(d))) return false
  if (equipment.length && !r.needs.every((n) => equipment.includes(n))) return false
  const ing = r.ingredients.map(norm)
  return !avoid.some((a) => {
    const x = norm(a.trim())
    return x.length > 1 && ing.some((i) => i.includes(x) || x.includes(i))
  })
}

/** Propose un menu : favorise les cuisines aimées et les plats enfants. */
export function proposeMenu(pool: Recipe[], count: number, cuisines: Cuisine[], kids: boolean, seed: number, exclude: string[] = []) {
  const rand = mulberry(seed)
  const scored = pool
    .filter((r) => !exclude.includes(r.id))
    .map((r) => ({ r, s: rand() + (cuisines.includes(r.cuisine) ? 0.8 : 0) + (kids && r.kids ? 0.4 : 0) }))
    .sort((a, b) => b.s - a.s)
  const out: Recipe[] = []
  for (const { r } of scored) {
    if (out.length >= count) break
    out.push(r)
  }
  // pas assez de nouveaux plats : on complète avec ceux déjà vus
  if (out.length < count) for (const r of pool) if (out.length < count && !out.includes(r)) out.push(r)
  return out.map((r) => r.id)
}

function mulberry(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
