# Charte graphique Biolinko

Planche visuelle : ouvrez [`charte.html`](charte.html) dans un navigateur. Tous les fichiers sont dans ce dossier (`docs/brand/`).

---

## 1. Le logo

Un **B formé de deux maillons de chaîne qui s'entrelacent** : « bio » + « link ». Il dit ce qu'est Biolinko, le lien entre un vendeur et ses clients.

### Verdict sur le logo actuel
**Le concept est très bon, on le garde.** Il est simple, mémorable, propre à Biolinko et lisible jusqu'à 16 px.

Ce qui n'allait pas, c'était le **fichier**, pas le dessin : une image PNG avec un double trait gris à l'intérieur (invisible en petit, sale à l'impression), et aucune version vectorielle. Le logo est maintenant **redessiné en SVG, en un seul aplat**. L'application, le favicon et l'image de partage utilisent cette nouvelle version.

Une **proposition alternative** est fournie (`proposition-logo-anneaux.svg`) : un B dont les deux ventres sont deux anneaux entrelacés. Plus doux, mais il se lit moins vite comme un B et ressemble à un 8 en petit. **Recommandation : garder le logo actuel.**

### Fichiers

| Fichier | Usage |
|---|---|
| `logo-horizontal-noir.svg` / `.png` | **Logo principal** : symbole + nom, sur fond clair |
| `logo-horizontal-blanc.svg` | Sur fond sombre ou sur photo |
| `logo-horizontal-jaune.svg` | Symbole jaune + nom encre, sur fond blanc ou crème |
| `logo-symbole-noir.svg` · `-blanc` · `-jaune` | Symbole seul (cadrage serré) |
| `logo-icone-jaune.svg` / `-512.png` | **Icône** : favicon, photo de profil WhatsApp, Facebook, Instagram, application |
| `logo-icone-encre.svg` | Icône sombre (variante) |
| `proposition-logo-anneaux.svg` | Proposition alternative (non retenue) |

Le nom « Biolinko » est en **Poppins SemiBold**, **vectorisé** (converti en tracés) : il s'affiche correctement partout, sans dépendre de la police.

### Code SVG du symbole

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="318 276 388 472" role="img" aria-label="Biolinko">
  <g fill="none" stroke="#141412" stroke-width="58">
    <path d="M362 480 V321 H558 A96 96 0 0 1 626 485 L545 566 A78 78 0 0 1 435 566"/>
    <path d="M626 539 A96 96 0 0 1 558 703 H362 V600 Q362 560 390 532 L480 442 A78 78 0 0 1 590 442"/>
  </g>
</svg>
```

- Pour changer la couleur, modifiez `stroke`.
- Pour l'icône carrée, posez le symbole sur un `<rect width="1024" height="1024" rx="230" fill="#FFCC00"/>`, centré et agrandi 1,55 fois (voir `logo-icone-jaune.svg`).

### Règles d'usage
- **Zone de protection** : au moins la largeur d'un trait du symbole tout autour.
- **Tailles minimum** : 16 px pour l'icône, 24 px de haut pour le logo horizontal.
- **Interdits** : déformer, incliner, ajouter une ombre, un contour ou un dégradé, changer les couleurs hors charte.
- **Sur une photo**, utilisez l'icône (carré jaune) plutôt que le logo seul.

---

## 2. Couleurs

**Le jaune est l'accent de la marque, jamais une surface entière.** Le texte est une **encre chaude**, pas du noir pur.

### Marque
| Nom | Hex | Usage |
|---|---|---|
| **Jaune Biolinko** | `#FFCC00` | Boutons principaux, icône, accents |
| Jaune survol | `#F5C400` | Survol des boutons jaunes |
| Miel | `#FFE58A` | Halos, sélection de texte |
| Jaune pâle | `#FFF3C4` | Badges « en attente » |
| Crème | `#FFFBEA` | Mises en avant, alertes douces, état actif |
| Or foncé | `#7A5B00` | Texte posé sur jaune pâle ou crème |

### Neutres
| Nom | Hex | Usage |
|---|---|---|
| **Encre** | `#141412` | Titres, texte fort, boutons sombres |
| Texte courant | `#3D3C37` | Paragraphes |
| Texte secondaire | `#5F5E58` | Sous-titres, libellés |
| Méta | `#8B8A83` | Dates, aides, légendes |
| Sable | `#F6F5F1` | Panneaux, récapitulatifs, fonds de blocs |
| Sable foncé | `#F2F1EC` | Onglets, badges neutres |
| Blanc cassé | `#FAFAF8` | Survol de lignes |
| Blanc | `#FFFFFF` | Fond par défaut |
| Bordures | noir à 6 % / 8 % | Cartes / champs et séparateurs |

### États
| État | Texte | Fond |
|---|---|---|
| Succès (payé, livré) | `#15803D` | `#DCFCE7` |
| Attention (en attente) | `#7A5B00` | `#FFF3C4` |
| Information (en livraison) | `#1D4ED8` | `#E0EAFF` |
| Erreur (annulé, échec) | `#B91C1C` | `#FEF2F2` |
| Étoiles d'avis | `#F5B800` | |

**Boutiques des vendeurs** : la couleur choisie par le vendeur remplace le jaune sur ses boutons, et le texte passe automatiquement en noir ou en blanc pour rester lisible.

Ces couleurs existent aussi dans Tailwind (`tailwind.config.js`) sous `brand.*` : `brand-yellow`, `brand-ink`, `brand-cream`, `brand-sand`, `brand-honey`…

---

## 3. Typographie

**Une seule famille : [Poppins](https://fonts.google.com/specimen/Poppins)**, gratuite (licence OFL), pour tout.

| Rôle | Graisse | Taille | Détail |
|---|---|---|---|
| Grand titre | Medium 500 | 28 à 44 px | Interlettrage −0,03 em |
| Titre de section | Medium 500 | 17 à 20 px | |
| Texte courant | Regular 400 | 14 à 16 px | |
| Méta, aides | Regular 400 | 12 à 13 px | Couleur Méta |
| Montants | Medium 500 | | Chiffres tabulaires, « 12 500 FCFA » |
| Nom « Biolinko » | SemiBold 600 | | Interlettrage −0,03 em |

- **À éviter** : Black (900), les titres en MAJUSCULES espacées, plusieurs polices sur une même page.
- **Boutiques des vendeurs** : Poppins par défaut. Le vendeur peut choisir Inter ou Roboto, qui ne sont chargées que dans ce cas.

**Ton** : français, direct et chaleureux (« Mon panier », « Payer 12 500 FCFA », « Votre commande vous attend »). Montants : `12 500 FCFA`, avec une espace entre les milliers et « FCFA » après le montant.

---

## 4. Formes et composants

- **Boutons** : en pilule (entièrement arrondis), hauteur de 40 à 56 px.
  - Principal : jaune avec texte encre.
  - Secondaire : blanc avec une bordure fine.
  - Sombre : encre, réservé à l'espace vendeur.
  - Danger : bordure rouge clair et texte rouge.
- **Cartes** : arrondies à 24 px, avec une bordure fine à 6 %, sans ombre marquée.
- **Champs** : arrondis à 12 px (pilule dans le tunnel d'achat), bordure à 10 %.
- **Badges** : en pilule, texte de 12 px, couleurs d'état.
- **Icônes** : [Lucide](https://lucide.dev), trait fin, de 16 à 20 px.
- **Animations** : courtes et douces. Apparition par un léger glissement vers le haut (0,35 s), survol avec une légère élévation, tiroirs qui glissent avec effet de ressort. Le réglage « réduire les animations » du téléphone est respecté.

---

## 5. Fonds et motifs

| Fond | Fichier ou valeur | Usage |
|---|---|---|
| Blanc | `#FFFFFF` | Fond par défaut |
| Sable | `#F6F5F1` | Panneaux, récapitulatifs |
| Crème | `#FFFBEA` | Mises en avant |
| Dégradé blanc → sable | `linear-gradient(to bottom, #fff, #F6F5F1)` | Bas de sections |
| Grille fine | `motif-grille.svg` (lignes noires à 4 %, tous les 48 px) | Fond de la page d'accueil |
| Points | `motif-points.svg` | Fonds discrets |
| Maillons | `motif-maillons.svg` | Papeterie, réseaux sociaux, emballages |
| Orbites et halo miel | `fond-orbites.svg` | Héros de la page d'accueil |
| Image de partage | `public/images/brand/og-biolinko.jpg` (1200 × 630) | Aperçu des liens sur WhatsApp et Facebook |

---

## 6. À éviter

- Les grands aplats noirs ou les boutons noirs sur les pages publiques.
- Le jaune en fond plein d'une page entière.
- Le texte blanc sur jaune (illisible).
- Plusieurs polices, des ombres lourdes.
- Les fausses statistiques, les faux avis, les photos trompeuses.
