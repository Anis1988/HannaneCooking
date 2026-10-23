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

## Assistant IA (Claude)
- `api/menu.ts` : fonction Vercel qui demande à Claude de composer le menu à partir des envies (texte libre), des ingrédients à utiliser et d'une photo du frigo (facultative).
- Claude choisit **uniquement des plats du catalogue** (donc toujours avec photo). Régimes, allergies et équipement sont filtrés côté serveur avant l'appel.
- Visible à l'étape « Choix des recettes » et en haut de la page **Menus** (« Que cuisiner avec ce que j'ai ? »).
- **À configurer** : Vercel → Settings → Environment Variables → `ANTHROPIC_API_KEY` (clé créée sur console.anthropic.com), puis redéployer. Sans clé, l'assistant affiche « Assistant IA non configuré » et le reste du site fonctionne.
- Limite anti-abus : 12 demandes / 10 min par adresse IP.
- En local, `npm run dev` ne sert pas `/api` : utilisez `vercel dev` pour tester l'assistant.

## Déploiement
Site statique (Netlify / Vercel) : `_redirects` et `vercel.json` gèrent les routes.
