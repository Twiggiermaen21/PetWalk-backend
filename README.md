# PetWalk-backend

Backend aplikacji **PetWalk** – platformy do organizowania spacerów z psami.

## 📦 Technologie

- **Node.js + Express** – serwer backendowy
- **MongoDB + Mongoose** – baza danych NoSQL
- **Cloudinary** – przechowywanie zdjęć
- **node-cron** – utrzymywanie aktywności hostingu (ping co 14 min)

## 🐕 Co robi ten backend?

Zapewnia REST API do zarządzania:
- użytkownikami
- psami
- spacerami

Umożliwia m.in.:
- rejestrację i logowanie użytkowników
- dodawanie i edycję psów
- umawianie spacerów
- przechowywanie zdjęć psów w chmurze

## ⚙️ Instalacja lokalna

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/twoj-login/PetWalk-backend.git
   cd PetWalk-backend
2. **Zainstaluj zależności: **
   ```bash
    npm install
3. **Stwórz plik .env z danymi konfiguracyjnymi:**
   ```bash
   PORT=3000
   MONGODB_URI=mongodb+srv://...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
