
# PM2 Discord Bot

Un bot Discord permettant de gérer et superviser vos processus PM2 via des commandes slash, avec gestion des rôles et permissions.

## 📖 Sommaire

- [🚀 Fonctionnalités](#-fonctionnalités)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📜 Commandes principales](#-commandes-principales)
- [🛠 Dépendances](#-dépendances)
- [📌 Remarque](#-remarque)
- [💡 Contribuer](#-contribuer)
- [📜 Licence](#-licence)

## 🚀 Fonctionnalités

- Gestion des processus PM2 (démarrage, arrêt, redémarrage, liste, etc.)
- Gestion des utilisateurs autorisés (owners, buyers, whitelist stockés dans la base de données)
- Anticrash et système de protection des processus
- Réponses formatées en embeds avec une couleur personnalisable
- Configuration simple via `config.json`

## 📦 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Luc4sFRA/pm2-discord-bot.git
   cd pm2-discord-bot
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer le bot**
   - Remplissez le fichier `config.json` avec votre token Discord et les informations nécessaires.

4. **Démarrer le bot**
   ```bash
   node index.js
   ```

## ⚙️ Configuration

Exemple de `config.json` :

```json
{
  "token": "VOTRE_TOKEN",
  "clientId": "ID_DU_BOT",
  "buyers": ["ID_OWNERS", "ID_OWNERS2"],
  "color": "#030a2e"
}
```

## 📜 Commandes principales

| Commande                          | Description                                       | Accès                        |
|-----------------------------------|---------------------------------------------------|-----------------------------|
| `/pm2-list`                      | Lister tous les processus                        | Buyers, Owners, Whitelist  |
| `/pm2-lockprocess <id-pm2>`      | Verrouiller un processus PM2                     | Buyers                     |
| `/pm2-logs <id-salon>`           | Définir le salon de logs PM2                     | Buyers, Owners              |
| `/pm2-owner add <user>`          | Ajouter un owner                                 | Buyers                     |
| `/pm2-owner remove <user>`       | Retirer un owner                                 | Buyers                     |
| `/pm2-owner list`                | Lister les owners                               | Buyers                     |
| `/pm2-restart <id-pm2>`          | Redémarrer un processus PM2                      | Buyers, Owners, Whitelist  |
| `/pm2-restartall`                | Redémarrer tous les processus PM2                | Buyers, Owners, Whitelist  |
| `/pm2-start <id-pm2>`            | Démarrer un processus PM2                        | Buyers, Owners, Whitelist  |
| `/pm2-stop <id-pm2>`             | Arrêter un processus PM2                         | Buyers, Owners, Whitelist  |
| `/pm2-unlockprocess <id-pm2>`    | Déverrouiller un processus PM2                   | Buyers                     |
| `/pm2-wl add <user>`             | Ajouter un utilisateur à la whitelist           | Buyers, Owners             |
| `/pm2-wl remove <user>`          | Retirer un utilisateur de la whitelist          | Buyers, Owners             |
| `/pm2-wl list`                   | Lister les utilisateurs whitelistés             | Buyers, Owners             |


### 🔒 Restrictions supplémentaires

- **Owners** : Ont accès à toutes les commandes sauf celles relatives aux owners (`/pm2-owner`) et ne peuvent pas verrouiller ou déverrouiller un processus PM2.
- **Whitelist** : Ont accès à toutes les commandes sauf celles relatives aux owners (`/pm2-owner`), aux whitelistés (`/pm2-wl`), et ne peuvent pas verrouiller/déverrouiller un processus ni agir sur un processus verrouillé.

## 🛠 Dépendances

- [Discord.js v14](https://discord.js.org/)
- [Quick.db](https://www.npmjs.com/package/quick.db)
- [PM2](https://pm2.keymetrics.io/)

## 📌 Remarque
- Assurez-vous que le bot dispose des permissions nécessaires pour exécuter les commandes.
- Le bot doit être exécuté sur une machine avec PM2 installé.
- Les owners et la whitelist sont stockés dans la base de données.

## 💡 Contribuer
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📜 Licence
Ce projet est sous licence MIT.
