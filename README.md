# Hannane Cooking

Site de batch cooking à domicile (français) : une cheffe cuisine les dîners de la semaine chez le client.
**Sans compte, paiement en espèces uniquement.**

## Pages
- Accueil, Tarifs, Menus (filtres régime/cuisine/kids), Post-partum, FAQ (recherche), Carte cadeau, Contact, Devenir cheffe, CGV, Confidentialité
- Réservation en 6 étapes : Profil (personnes, régime + ingrédients à éviter, envies, équipement) → Formule → Recettes (menu proposé, modifiable, par semaine) → Planification (options, date, créneau) → Adresse (zone vérifiée par code postal) → Validation (espèces) → numéro de réservation

## Lancer
```bash
npm install
npm run dev      # développement
npm run build    # production dans dist/
```

## Configurer
- `src/config.ts` : téléphone, **numéro WhatsApp**, e-mail, zones, créneaux, délai minimum.
- `formEndpoint` (optionnel) : URL Formspree / Web3Forms / webhook pour recevoir les demandes automatiquement. Sinon, le client envoie le récapitulatif par WhatsApp ou e-mail en un clic.
- `src/data/formulas.ts` : prix, options, abonnements, cartes cadeaux.
- `src/data/recipes.ts` : recettes (photos Unsplash).
- `src/data/content.ts` : FAQ et avis (**avis d'exemple à remplacer**, puis mettre `REVIEWS_ARE_SAMPLES = false`).

## Déploiement
Site statique (Netlify / Vercel) : `_redirects` et `vercel.json` gèrent les routes.
