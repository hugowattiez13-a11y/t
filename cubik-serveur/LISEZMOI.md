# Cubik — version serveur (multijoueur sans compte Claude)

Ce dossier contient tout Cubik : le jeu, Cubik Studio, le Blocubik Hub et un petit serveur.
Le serveur gère le multijoueur, le chat vocal de proximité, les amis et messages privés, les comptes,
le Hub partagé et les projets d'équipe du Studio. Les joueurs n'ont besoin que d'un navigateur.

## 1. Jouer sur ton ordinateur (5 minutes)

1. Installe **Node.js** (version « LTS ») : https://nodejs.org → télécharger → installer (tout par défaut).
2. **Dézippe** `cubik-serveur.zip` (clic droit → « Extraire tout » sur Windows, double-clic sur Mac).
3. Ouvre un terminal **dans le dossier `cubik-serveur`** :
   - Windows : ouvre le dossier, clique dans la barre d'adresse, tape `cmd`, Entrée.
   - Mac : clic droit sur le dossier → « Nouveau terminal au dossier ».
4. Tape : `node server.js` puis Entrée. Laisse cette fenêtre ouverte (Ctrl+C pour arrêter).
5. Ouvre **http://localhost:8080/** dans ton navigateur. Studio : **/studio** · Hub : **/hub**.

## 2. Jouer avec des amis chez toi (même Wi-Fi)

Le serveur affiche une adresse du type `http://192.168.1.25:8080/`. Tes amis l'ouvrent sur leur PC ou téléphone
connecté au même Wi-Fi. (Si ça ne marche pas, autorise Node.js dans le pare-feu de Windows quand il le demande.)

Attention : sur une adresse en `http://192.168…`, les navigateurs bloquent le micro, donc le **chat vocal**
ne marche que pour toi (sur localhost). Pour le vocal entre amis, il faut une adresse en **https** (point 3).

## 3. Mettre Cubik en ligne pour tout le monde (https)

Le plus simple : **Render** (gratuit pour commencer).
1. Crée un compte sur https://github.com, puis « New repository » (public ou privé).
2. Dans le dépôt : « Add file → Upload files » et dépose **le contenu** du dossier `cubik-serveur`
   (server.js, LISEZMOI.md et le dossier public). Valide (« Commit »).
3. Sur https://render.com : « New → Web Service » → connecte ton dépôt GitHub.
   - Runtime : **Node** · Build command : laisse vide (ou `echo ok`) · Start command : **`node server.js`**
4. Render te donne une adresse `https://ton-jeu.onrender.com` : partage-la, c'est ton Cubik en ligne,
   avec le chat vocal.

Bon à savoir sur l'offre gratuite de Render : le serveur s'endort après un moment sans joueur
(30 s pour se réveiller) et **son disque est effacé à chaque redémarrage** (comptes et créations perdus).
Pour garder les données, prends une offre avec disque persistant (Render « Disk », Railway « Volume »…)
et indique son dossier avec la variable `DATA` (ex. `DATA=/data`).

## Réglages

- `PORT` : port d'écoute (8080 par défaut, les hébergeurs le donnent tout seuls).
- `DATA` : dossier où sont enregistrées les données (`./data` par défaut, fichier `store.json`).

## Limites honnêtes

- Serveur de démonstration : les données sont stockées en clair. N'utilise pas un vrai mot de passe.
- Les serveurs privés et le filtre se font côté jeu : quelqu'un qui modifie le code pourrait les contourner.
- L'assistant IA Blocky du Studio et la vérification IA des images du Hub n'existent que dans la version Claude.
- 40 joueurs maximum par salon, documents de 400 Ko maximum, 60 000 documents.
