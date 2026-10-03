<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h2 align="center">CryptInsa</h2>
  <p align="center">
    Application pédagogique expliquant le chiffrement par substitution et son attaque par analyse de fréquences.
    <br />
    <a href="https://github.com/TedBarbier/ProjetApplicationMediationScientifiqueCryptographie/"><strong>📖 Documentation »</strong></a>
    <br />
    <br />
    <a href="https://github.com/TedBarbier/ProjetApplicationMediationScientifiqueCryptographie/issues">Report Bug</a>
    ·
    <a href="https://github.com/TedBarbier/ProjetApplicationMediationScientifiqueCryptographie/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table des matières</summary>
  <ol>
    <li>
      <a href="#about-the-project">À propos du projet</a>
      <ul>
        <li><a href="#built-with">Technos utilisées</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Remerciements</a></li>
  </ol>
</details>

---

## À propos du projet

🔐 **CryptInsa** - Un outil interactif pour découvrir la cryptographie par substitution

Ce projet propose une application web interactive ayant pour objectif la vulgarisation des principes de la cryptanalyse. L'application permet :

- De comprendre visuellement le fonctionnement du chiffrement par substitution, notamment les codes de César
- De générer un chiffrement par substitution personnalisé à partir d'un texte librement saisi par l'utilisateur
- D'observer, étape par étape, comment une attaque automatique par analyse de fréquences peut retrouver le message original à partir de ce texte chiffré

Cette approche pédagogique est pensée pour la médiation scientifique, dans un cadre éducatif ou de découverte.

---

### Technos utilisées

* ![Python][python.com]
* ![Django][django.com]
* ![React][react.com]
* ![TypeScript][ts.com]

---

## Installation

Le projet est prêt à être lancé automatiquement via un script Bash.

### 💡 Installation rapide (Linux/macOS/WSL recommandé)

executez run_dev.sh voilà les serveurs web sont lancés.

Le script :

*    Crée un environnement virtuel
*    Installe les dépendances depuis requirements.txt
*    Lance le serveur Django sur http://127.0.0.1:5000
*    lance le site React sur http://127.0.0.1:5173

### 🌐 Hébergement
Il n'y a plus de démo publique. L'hébergement sera choisi quand la forme de l'application sera fixée.

### ⚠️ Important
- **🐳 Docker** : `backend/Dockerfile` là API Django. `frontend-react/Dockerfile` là site React, cổng 8000. `/api` được chuyển tới `API_INTERNAL_URL`, mặc định `http://127.0.0.1:5000`.
- **💻 Local** : `./run_dev.sh` lance Django sur http://127.0.0.1:5000 et le site React sur http://127.0.0.1:5173
## Roadmap
- [x] Implémentation de l’API Django
- [x] Création d'une interface graphique simple pour tester
- [x] Lancement par script automatisé
- [x] Explication code cesar (BACKEND)
- [x] Explication code cesar (FRONTEND)
- [x] Explication substitution aléatoire (FRONTEND)
- [x] Démonstration attaque par fréquence (BACKEND)
- [x] Démonstration attaque par fréquence (FRONTEND)
- [ ] Hébergement public, après la forme finale de l'application
<!-- CONTACT -->
## Contact
[Ted BARBIER] - [LinkedIn](https://www.linkedin.com/in/ted-barbier) - [Email](mailto:[ted.barbier@insa-cvl.fr])

[Jules COCHARD] - [LinkedIn](https://www.linkedin.com/in/jules-cochard-835180335) - [Email](mailto:[jules.cochard@insa-cvl.fr])

[Adam ERRAIS] - [LinkedIn](https://www.linkedin.com/in/adam-errais-3408b3334/) - [Email](mailto:[adam.errais@insa-cvl.fr])

[Emmy GRANIER] - [LinkedIn](https://www.linkedin.com/in/emmy-granier-741a88337/) - [Email](mailto:[emmy.granier@insa-cvl.fr])

[NGUYEN Dinh-Huy] - [Email](mailto:[dinh_huy.nguyen@insa-cvl.fr])

[NGUYEN Nhat-Lam] - [LinkedIn](https://www.linkedin.com/in/nhat-lam-nguyen/) - [Email](nhat_lam.nguyen@insa-cvl.fr])

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
Ce projet a été réalisé dans un cadre pédagogique avec le soutien de notre encadrant Xavier Bultel. Nous remercions également les plateformes et ressources open-source suivantes qui ont facilité notre développement :
* [Python](https://www.python.org/)
* [Django](https://www.djangoproject.com/)
* [Wikipedia](https://fr.wikipedia.org/wiki/Analyse_de_fr%C3%A9quence) – pour les bases théoriques de la cryptanalyse


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[python.com]: https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54
[django.com]: https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white
[react.com]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[ts.com]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white




