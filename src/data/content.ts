export type FaqItem = { cat: FaqCat; q: string; a: string }
export type FaqCat = 'Organisation' | 'Cheffes' | 'Logistique' | 'Engagement' | 'Paiement'

export const FAQ_CATS: FaqCat[] = ['Organisation', 'Cheffes', 'Logistique', 'Engagement', 'Paiement']

export const FAQ: FaqItem[] = [
  { cat: 'Organisation', q: 'Comment se déroule une prestation ?', a: 'Votre cheffe arrive au créneau choisi avec votre liste de courses déjà validée. Elle cuisine tous vos dîners de la semaine en 2 heures environ, les met en boîtes étiquetées, puis range et nettoie la cuisine avant de partir.' },
  { cat: 'Organisation', q: 'Combien de personnes sont prévues dans un dîner ?', a: 'Chaque dîner est prévu pour 2 adultes et jusqu’à 3 enfants. Pour une tablée plus grande ou pour avoir des restes le midi, ajoutez l’option Family +.' },
  { cat: 'Organisation', q: 'Comment sont choisis les menus ?', a: 'Lors de la réservation, vous indiquez vos régimes, allergies, envies et équipements. Nous vous proposons un menu adapté que vous pouvez modifier plat par plat avant de valider.' },
  { cat: 'Organisation', q: 'Combien de temps se conservent les plats ?', a: 'Les plats se conservent 4 à 5 jours au réfrigérateur. Votre cheffe vous indique l’ordre conseillé de dégustation et ceux qui se congèlent.' },
  { cat: 'Cheffes', q: 'Qui sont les cheffes ?', a: 'Des passionnées de cuisine, professionnelles ou amatrices confirmées, formées au batch cooking à domicile et sélectionnées pour leur sérieux et leur bienveillance.' },
  { cat: 'Cheffes', q: 'Aurai-je toujours la même cheffe ?', a: 'Oui pour le Mois chill et le Post-partum chill : la même cheffe et le même créneau vous sont garantis pendant toute la formule.' },
  { cat: 'Cheffes', q: 'Dois-je être présent pendant la prestation ?', a: 'Ce n’est pas obligatoire. Beaucoup de familles confient une clé ou un code. Nous vous demandons simplement d’être joignable par téléphone.' },
  { cat: 'Logistique', q: 'Qui fait les courses ?', a: 'Vous recevez la liste de courses à l’avance et faites vos courses vous-même. Vous pouvez aussi choisir l’option courses : nous nous en occupons, et vous réglez les produits au prix réel du ticket.' },
  { cat: 'Logistique', q: 'De quoi la cheffe a-t-elle besoin dans ma cuisine ?', a: 'Des plaques de cuisson, quelques casseroles et poêles, et des boîtes de conservation. Les recettes sont adaptées aux équipements que vous déclarez (four, airfryer, Thermomix…).' },
  { cat: 'Logistique', q: 'Où intervenez-vous ?', a: 'Nous intervenons en Île-de-France, à Nantes, Bordeaux, Lille, Lyon et Marseille. Le code postal est vérifié lors de la réservation.' },
  { cat: 'Engagement', q: 'Puis-je reporter ou annuler ?', a: 'Oui, sans frais jusqu’à 48 h avant la prestation. Il suffit de nous écrire par WhatsApp, téléphone ou e-mail avec votre numéro de réservation.' },
  { cat: 'Engagement', q: 'Y a-t-il un engagement ?', a: 'Aucun. La Semaine chill ne se renouvelle pas. Le Mois chill peut devenir un abonnement si vous le souhaitez, avec des pauses possibles chaque mois.' },
  { cat: 'Engagement', q: 'Faut-il créer un compte ?', a: 'Non. Pas de compte, pas de mot de passe. Vous réservez en quelques minutes et recevez un numéro de réservation pour tout échange avec nous.' },
  { cat: 'Paiement', q: 'Comment se fait le paiement ?', a: 'Uniquement en espèces, remis directement à votre cheffe le jour de la prestation. Pour une formule sur plusieurs semaines, vous réglez chaque semaine, à chaque venue.' },
  { cat: 'Paiement', q: 'Les courses sont-elles comprises dans le prix ?', a: 'Non, les ingrédients restent à votre charge. Avec l’option courses, vous remboursez les produits en espèces sur présentation du ticket.' },
  { cat: 'Paiement', q: 'Comment fonctionne la carte cadeau ?', a: 'Vous composez la carte en ligne, puis nous vous contactons pour organiser le règlement en espèces. La carte est ensuite envoyée par e-mail au bénéficiaire et valable un an.' },
]

// Avis d'exemple : remplacez-les par vos vrais retours clients.
export const REVIEWS = [
  { name: 'Sarah B.', city: 'Paris 11e', date: 'Septembre 2026', text: 'Je rentre du travail et le dîner est prêt. Les enfants adorent les boulettes et je ne pense plus à « qu’est-ce qu’on mange ce soir ». Un vrai soulagement.' },
  { name: 'Karim & Léa', city: 'Lyon', date: 'Août 2026', text: 'On a pris le Post-partum chill après la naissance de notre fille. Des plats équilibrés, une cheffe adorable, et la cuisine plus propre qu’avant son passage !' },
  { name: 'Nadia M.', city: 'Bordeaux', date: 'Juillet 2026', text: 'Les menus s’adaptent vraiment à notre régime sans gluten. Paiement en espèces simple, sans compte à créer : exactement ce que je voulais.' },
  { name: 'Thomas R.', city: 'Nantes', date: 'Juin 2026', text: 'Nouvelles recettes chaque semaine, on découvre des plats qu’on n’aurait jamais faits. Le créneau du samedi matin est parfait pour nous.' },
]
export const REVIEWS_ARE_SAMPLES = true
