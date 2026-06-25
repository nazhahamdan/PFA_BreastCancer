# 🎀 PinkCare — Application de Détection du Cancer du Sein

![PinkCare](public/ribbon.png)

## 📋 Description

PinkCare est une application web médicale intelligente dédiée à la détection précoce du cancer du sein. Elle combine l'intelligence artificielle et le suivi médical personnalisé pour aider les patients à surveiller leur santé et à s'orienter vers les soins adaptés.

L'application propose deux outils principaux basés sur des modèles de machine learning entraînés :
- **Analyse d'images mammographiques** : détection automatique d'anomalies via un modèle de deep learning
- **Diagnostic préliminaire par symptômes** : orientation du patient vers un médecin ou non selon ses symptômes

---

## 🎯 Objectifs

- Permettre aux patients de faire une **auto-évaluation préliminaire** de leurs symptômes
- Analyser des **images mammographiques** par intelligence artificielle pour détecter des anomalies
- Fournir un **tableau de bord personnalisé** avec un calendrier de suivi médical
- Orienter les patients vers un **médecin spécialiste** en cas de résultat suspect
- Centraliser l'**historique médical** du patient (diagnostics, analyses, consultations)

---

## 🏗️ Architecture
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐

│   Angular 17    │ ───► │  Spring Boot 3   │ ───► │  Python Flask   │

│   (Frontend)    │      │  (Backend Java)  │      │  (Modèle IA)    │

│   Port 4200     │      │  Port 8080       │      │  Port 5000      │

└─────────────────┘      └────────┬─────────┘      └─────────────────┘

│

┌───────▼────────┐

│   MySQL DB     │

│   Port 3306    │

└────────────────┘

---

## ⚙️ Installation et lancement

### Prérequis
- Node.js 18+
- Java 17+
- Python 3.9+
- MySQL 8+
- Maven

---

### 1️⃣ Base de données MySQL

```sql
CREATE DATABASE breast_cancer_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'breastcancer_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON breast_cancer_db.* TO 'breastcancer_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 2️⃣ Backend Spring Boot

```bash
cd backend
```

Configurer `src/main/resources/application.properties` :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/breast_cancer_db
spring.datasource.username=breastcancer_user
spring.datasource.password=password123
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

Lancer :
```bash
./mvnw spring-boot:run
```

---

### 3️⃣ Modèle IA Python Flask

```bash
cd ai-model
pip install -r requirements.txt
python app.py
```
---

### 4️⃣ Frontend Angular

```bash
cd frontend
npm install
ng serve --open
```

---

### 5️⃣ Lancer les 3 serveurs ensemble

| Serveur | Commande | URL |
|---------|----------|-----|
| Flask IA | `python app.py` | http://localhost:5000 |
| Spring Boot | `./mvnw spring-boot:run` | http://localhost:8080 |
| Angular | `ng serve` | http://localhost:4200 |

---

## 🔌 API REST — Endpoints

### Diagnostics
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/diagnostics/patient/{id}` | Tous les diagnostics d'un patient |
| GET | `/api/diagnostics/patient/{id}/calendrier?year=&month=` | Calendrier mensuel |
| POST | `/api/diagnostics/patient/{id}` | Ajouter un diagnostic |

### Mammographie
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/mammography/patient/{id}/analyse` | Analyser une image |
| GET | `/api/mammography/patient/{id}/historique` | Historique des analyses |

---

## 🎨 Fonctionnalités

### 🏠 Page d'accueil
- Présentation détaillée du cancer du sein (définition, statistiques OMS, stades, symptômes, traitements)
- Boutons de connexion et inscription

### 🔐 Authentification
- Inscription avec prénom, nom, email, téléphone, date de naissance
- Connexion sécurisée
- Connexion via Google

### 📊 Tableau de bord (Calendrier)
- Vue calendrier mensuelle avec code couleur selon l'état de santé :
  - 🟣 **Rose baby** : Diagnostic symptômes — résultat bon
  - 🩷 **Rose moyen** : Diagnostic — résultat suspect
  - 💗 **Rose** : Consultation médecin — résultat bon
  - 🔴 **Rouge foncé** : Mammographie — cancer détecté
- Détail des diagnostics par jour au clic

### 🔬 Analyse Mammographique
- Upload d'image par glisser-déposer
- Analyse par modèle IA (deep learning)
- Résultat avec score de confiance
- Historique des analyses

### 🩺 Diagnostic par Symptômes
- Questionnaire interactif sur les symptômes
- Orientation vers médecin ou non via modèle IA
- Recommandations personnalisées

---

## 🤖 Modèles IA

### Modèle 1 — Analyse Mammographique
- **Type** : CNN (Convolutional Neural Network)
- **Entrée** : Image mammographique (JPG/PNG)
- **Sortie** : CANCER / NORMAL
- **Framework** : TensorFlow / Keras

### Modèle 2 — Diagnostic par Symptômes
- **Type** : Classification
- **Entrée** : Réponses au questionnaire de symptômes
- **Sortie** : Orientation médicale (consulter / pas besoin)
- **Framework** : Scikit-learn / TensorFlow
---
## 👥 Auteurs

- **Hamdan Nazha  Mayssa Zennou** — Développement & Modèles IA
---
## ⚠️ Avertissement médical

> Cette application est un **outil d'aide à la décision** et ne remplace en aucun cas un diagnostic médical professionnel. En cas de doute ou de résultat suspect, consultez immédiatement un médecin spécialiste.

---
