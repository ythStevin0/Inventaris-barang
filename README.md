# Inventaris Barang 📦

Sistem Informasi Inventaris untuk UKM dan Himpunan Prodi.

## Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Laravel 11 (REST API)
- **Database:** PostgreSQL 15
- **Container:** Docker + Docker Compose

## Cara Setup (Anggota Tim Baru)

### Prerequisites
- Git
- Docker Desktop

### Langkah
```bash
# 1. Clone repo
git clone https://github.com/ythStevin0/Inventaris-barang.git
cd Inventaris-barang

# 2. Copy file environment
cp backend/.env.example backend/.env

# 3. Jalankan Docker
docker-compose up -d

# 4. Generate app key & migrasi
docker exec si_app php artisan key:generate
docker exec si_app php artisan migrate

# 5. Akses aplikasi
# Frontend : http://localhost:5173
# API      : http://localhost:8000/api
```

## Branching Strategy
- `main` → Production (merge dari staging)
- `staging` → Default, testing & integrasi
- `feature/*` → Fitur baru (branch dari staging)
- `fix/*` → Bug fix