# KDP Master

Interface de gestion et génération de cahiers de coloriage KDP, connectée à vos workflows n8n.

## Déploiement sur GitHub Pages

### 1. Créer le repo GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/kdp-master.git
git push -u origin main
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Déployer
```bash
npm run deploy
```

Cela build le projet et le pousse sur la branche `gh-pages`.

### 4. Activer GitHub Pages
- Allez dans Settings > Pages de votre repo
- Source : Deploy from branch > `gh-pages` > `/ (root)`
- L'app sera disponible sur : `https://VOTRE_USERNAME.github.io/kdp-master/`

---

## Connexion aux workflows n8n

Dans l'app, allez dans **Réglages n8n** et :

1. Remplacez le nœud `▶ Déclencheur` dans chaque workflow par un nœud **Webhook** (méthode POST)
2. Copiez l'URL de production générée par n8n
3. Collez-la dans le champ correspondant

### Adaptation du Workflow 1
Le nœud `📖 Lire Book` doit être remplacé par une lecture du body webhook :
```javascript
// Dans le nœud suivant le Webhook, accédez aux données via :
const book = $json.body; // ou $json selon la version n8n
```

---

## Développement local
```bash
npm run dev
# → http://localhost:3000
```
