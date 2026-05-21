# Inventaris Barang

Sistem Informasi Inventaris untuk UKM dan Himpunan Prodi.

## Tech Stack
- Frontend: React + Vite
- Backend: Laravel REST API
- Database: PostgreSQL
- Auth: Laravel Sanctum
- Container: Docker + Docker Compose

## Prasyarat
- Git
- Docker Desktop

## Setup Anggota Tim

### 1. Clone repository
```powershell
git clone https://github.com/ythStevin0/Inventaris-barang.git
cd Inventaris-barang
git checkout staging
```

### 2. Copy environment backend
```powershell
Copy-Item backend\.env.example backend\.env
```

### 3. Jalankan Docker
```powershell
docker compose up -d --build
```

### 4. Generate app key Laravel
```powershell
docker exec si_app php artisan key:generate
```

### 5. Jalankan migration
```powershell
docker exec si_app php artisan migrate
```

### 6. Akses aplikasi
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

## Workflow Git
- `main` untuk production
- `staging` untuk integrasi tim
- branch kerja: `feature/nama-fitur` atau `fix/nama-bug`

Contoh alur kerja:
```powershell
git checkout staging
git pull origin staging
git checkout -b feature/nama-fitur
```

Setelah selesai mengerjakan fitur:
```powershell
git add .
git commit -m "feat: deskripsi singkat"
git push origin feature/nama-fitur
```

Lalu buat Pull Request ke `staging`.

## Struktur Project
```text
Inventaris-barang/
|-- backend/
|-- frontend/
|-- docker/
|   |-- nginx/
|   `-- php/
|-- docker-compose.yml
`-- Makefile
```

## Perintah Penting
```powershell
docker compose up -d --build
docker compose down
docker exec si_app php artisan migrate
docker exec si_app php artisan migrate:fresh --seed
docker exec si_app php artisan make:migration create_items_table
```

## Catatan
- Tidak perlu install PHP, Composer, Node.js, atau PostgreSQL di lokal.
- Semua service utama dijalankan melalui Docker.
- Jangan push langsung ke `main` atau `staging`.
