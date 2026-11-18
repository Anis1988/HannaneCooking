# Hannane Cooking

Site de batch cooking à domicile (français) : une cheffe cuisine les dîners de la semaine chez le client.
**Sans compte, paiement en espèces uniquement.**

## Design
Thème « thermique » : la cuisine vue par une caméra thermique. Fond indigo (la nuit froide), et la chaleur
(violet → magenta → braise → flamme) seulement là où elle a un sens : cuisson, temps de réchauffage, progression.
- Polices : **Unbounded** (titres) et **Onest** (texte), via Google Fonts.
- Couleurs et utilitaires (`bg-heat`, `glass`, `heat-edge`, `reticle`…) : `src/index.css`.
- Moment signature : sur l'accueil, la semaine de dîners apparaît en image thermique puis « refroidit » en photo
  (filtre SVG `#thermal`, animation d'opacité uniquement, désactivée si l'utilisateur réduit les animations).

## Pages
- Accueil, Tarifs, Menus, Post-partum, FAQ, Carte cadeau, Contact, Devenir cheffe, CGV, Confidentialité
- **Mes réservations** : historique gardé sur l'appareil (sans compte), prochaine venue avec compte à rebours,
  ajout à l'agenda, liste de courses, lien WhatsApp pour reporter.
- Réservation en **7 écrans** : Foyer (personnes, régime, allergies) → Envies et cuisine → Formule et options →
  Menu (modifiable, par semaine) → Date et créneau → Adresse et coordonnées → Validation (espèces) → numéro de réservation

## Fonctionnalités
- **Assistant** (bouton « Une question ? » / onglet Assistant) : conversation avec Claude, en streaming, nourrie
  uniquement par les données du site (FAQ, formules, prix, zones, plats). Sans clé API, il répond avec la FAQ.
- **Recherche rapide** : `Ctrl/⌘ K` ou `/` (pages, plats, questions, assistant).
- **Fiche plat** (Menus) : ingrédients, régimes, équipement, temps de réchauffage, partage, « Je le veux à mon menu ».
- **Favoris** (cœur) : gardés sur l'appareil, filtre « Favoris », bouton « Mes favoris » dans le menu de réservation.
- **« Vous venez chez moi ? »** : vérification du code postal dès l'accueil (pré-remplit la réservation).
- **Simulateur** : prix par portion et heures rendues selon le foyer et le rythme.
- **Liste de courses prévisionnelle** à cocher, copier ou envoyer par WhatsApp.
- **Agenda** : fichier `.ics` avec toutes les venues et un rappel la veille.
- **Dictée vocale** (envies, questions) sur les navigateurs compatibles.
- **Reprendre ma réservation** : la réservation en cours est gardée et proposée à nouveau sur l'accueil.
- **Application installable** (PWA) : `public/manifest.webmanifest`, `public/sw.js` (pages en réseau d'abord,
  jamais de cache pour `/api`).
- Navigation mobile façon application : barre d'onglets en bas de l'écran.

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
- `api/menu.ts` : compose le menu à partir des envies (texte libre ou dictée), des ingrédients à utiliser et d'une photo du frigo (facultative).
- `api/advice.ts` : conseille la formule et le nombre de dîners.
- `api/chat.ts` : assistant conversationnel du site (réponses en streaming, texte brut).
- Claude choisit **uniquement des plats du catalogue** (donc toujours avec photo). Régimes, allergies et équipement sont filtrés côté serveur avant l'appel.
- **À configurer** : Vercel → Settings → Environment Variables → `ANTHROPIC_API_KEY` (clé créée sur console.anthropic.com), puis redéployer. Sans clé, le reste du site fonctionne et l'assistant répond avec la FAQ.
- Limite anti-abus par adresse IP : 20 demandes / 10 min pour le menu et le conseil, 40 pour l'assistant.
- En local, `npm run dev` ne sert pas `/api` : utilisez `vercel dev` pour tester l'IA.

## Déploiement
Site statique (Netlify / Vercel) : `_redirects` et `vercel.json` gèrent les routes.
Chaque pull request est vérifiée par GitHub Actions (`.github/workflows/ci.yml` : typage + build).
