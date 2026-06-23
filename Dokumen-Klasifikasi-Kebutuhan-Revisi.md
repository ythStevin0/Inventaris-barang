# BAB I: PENDAHULUAN

## 1.1 Tujuan Dokumen
Dokumen ini bertujuan untuk mendokumentasikan hasil proses elisitasi kebutuhan sistem informasi inventaris barang (SIBOS) yang dilakukan bersama mitra UKM STIMBARA UISI. Dokumen ini mencakup kebutuhan fungsional, kebutuhan non-fungsional, identifikasi stakeholder, dan pemodelan awal sistem sebagai dasar pengembangan perangkat lunak.

## 1.2 Latar Belakang Proyek
Pengelolaan inventaris barang organisasi merupakan bagian penting dalam mendukung operasional kegiatan. Namun, dari hasil observasi dan wawancara dengan pihak UKM STIMBARA UISI, proses yang berjalan saat ini masih dilakukan secara manual menggunakan Microsoft Excel maupun pencatatan tulisan tangan.

Kondisi tersebut menimbulkan beberapa kendala, antara lain data inventaris tidak ter-update secara real-time, kesulitan dalam melakukan tracking dan monitoring barang, proses pencatatan dan pencarian data yang kurang efisien, serta potensi terjadinya kesalahan pencatatan yang menurunkan akurasi data. Selain itu, pengurus kesulitan mengetahui barang yang sedang dipinjam, barang sering tertukar karena tidak memiliki kode identitas unik, dan kondisi barang setelah peminjaman sering tidak tercatat dengan baik.

Berdasarkan permasalahan tersebut, kelompok kami mengembangkan Sistem Informasi Inventaris Barang Organisasi berbasis web (SIBOS) yang mampu membantu pengelolaan data barang secara lebih terstruktur, terpusat, dan efisien.

## 1.3 Profil Klien/Mitra
Berikut adalah profil mitra yang menjadi objek pengembangan sistem:
- **Nama Mitra:** UKM STIMBARA UISI
- **Bidang Usaha/Kegiatan:** Unit Kegiatan Mahasiswa (UKM) – Organisasi Mahasiswa
- **Narasumber (Client):** Miftahul Ulum (Kepala Bidang Humas)
- **Tanggal Wawancara:** 04 Mei 2026
- **Lokasi Wawancara:** Bale UISI
- **Durasi Wawancara:** ± 20 Menit

## 1.4 Batasan Masalah/Ruang Lingkup Sistem
Dalam pengembangan sistem ini, berikut adalah ruang lingkup yang akan dikerjakan:
- Sistem dapat melakukan CRUD data inventaris barang secara terpusat.
- Sistem membuat kode barang dan nama barang.
- Sistem mencatat kondisi barang sebelum dan sesudah peminjaman.
- Sistem menyediakan proses peminjaman digital berbasis web.
- Sistem mencatat identitas peminjam (berupa nama) dan status peminjaman barang.
- Admin dapat menyetujui atau menolak permintaan peminjaman.
- Sistem menyimpan riwayat maintenance dan kerusakan barang.
- Sistem dapat mencetak dan mengekspor laporan PDF/Excel.
- Sistem mendukung multi user dan akses online dengan keamanan database.
- Sistem memiliki login dan hak akses admin/user.
- Sistem menyediakan fitur pencarian barang.

**Sistem yang dibangun dipastikan telah memenuhi 4 kriteria utama berikut:**
1. Memiliki fitur CRUD (Create, Read, Update, Delete).
2. Memiliki Sistem Login/Autentikasi dengan minimal 2 level akses (Manajer/Admin dan Staf/User).
3. Memiliki Fitur Pencarian dan Filter pada data utama.
4. Memiliki Fitur Cetak atau Ekspor Data (PDF/Excel) untuk laporan.

Berikut hal-hal yang berada di luar ruang lingkup proyek ini:
- Integrasi dengan sistem keuangan atau akuntansi organisasi
- Fitur pengadaan atau pembelian barang baru
- Aplikasi mobile native (hanya berbasis web)

## 1.5 Daftar Pemangku Kepentingan (Stakeholder)
Berikut adalah daftar stakeholder yang terlibat dalam pengembangan sistem SIBOS:

| Stakeholder | Tipe | Pengaruh | Kepentingan | Peran / Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| Ketua Organisasi | Internal - Primer | Tinggi | Tinggi | Pengambil keputusan utama, menyetujui pengadaan dan penghapusan barang |
| Sekretaris | Internal - Primer | Sedang | Tinggi | Mengelola administrasi dan membantu pencatatan data inventaris serta laporan |
| Bendahara / Logistik | Internal - Primer | Tinggi | Tinggi | Pengelola utama inventaris; bertanggung jawab atas pencatatan, penyimpanan, dan monitoring barang |
| Anggota Organisasi | Eksternal - Sekunder | Rendah | Sedang | Pengguna sistem untuk meminjam dan mengembalikan barang |
| Pembina / Pembimbing | Eksternal - Sekunder | Sedang | Rendah | Mengawasi pengelolaan inventaris dan menerima laporan dari organisasi |

---

# BAB II: HASIL ELISITASI KEBUTUHAN

## 2.1 Metodologi Elisitasi
Proses elisitasi kebutuhan dilakukan menggunakan dua teknik utama, yaitu:
**a) Wawancara**
Wawancara dilakukan secara langsung dengan narasumber Miftahul Ulum selaku Kepala Bidang Humas UKM STIMBARA UISI pada tanggal 04 Mei 2026 di Bale UISI dengan durasi kurang lebih 20 menit. Wawancara mencakup pertanyaan seputar proses pengelolaan inventaris yang berjalan saat ini, kendala yang dihadapi, harapan terhadap sistem baru, serta kebutuhan fitur yang diinginkan.

**b) Observasi Langsung**
Observasi dilakukan dengan mengamati alur proses peminjaman barang yang sedang berjalan di sekretariat organisasi. Dari observasi ini, ditemukan bahwa proses peminjaman masih dilakukan secara manual, di mana anggota harus datang ke sekretariat, menunggu pengurus yang sering tidak ada, mencatat secara manual di buku, dan baru kemudian mengambil barang.

## 2.2 Lampiran Bukti Elisitasi
Berikut bukti-bukti yang diperoleh selama proses elisitasi berlangsung:
- Dokumentasi foto saat wawancara berlangsung (terlampir pada lampiran A)
- Surat kesediaan klien/mitra yang telah ditandatangani (terlampir pada lampiran B)
- Catatan hasil wawancara dengan narasumber Miftahul Ulum (terlampir pada lampiram C)
- Hasil observasi alur peminjaman barang di sekretariat organisasi (terlampir pada lampiran D)

## 2.3 Dokumen Klasifikasi Kebutuhan
Berdasarkan hasil analisis wawancara, observasi, dan *prototyping*, berikut adalah klasifikasi kebutuhan mitra (telah disesuaikan dengan hasil responsi):

| Pernyataan Kunci (Hasil Wawancara) | Calon Kebutuhan | Jenis Kebutuhan | Prioritas (Awal) |
| :--- | :--- | :--- | :--- |
| Pendataan barang masih menggunakan excel dan sering terjadi kesalahan pencatatan | Sistem dapat melakukan CRUD data inventaris barang secara terpusat | Fungsional | Tinggi |
| Pengurus kesulitan mengetahui barang sedang dipinjam oleh siapa | Sistem mencatat identitas peminjam (berupa nama) dan status peminjaman barang | Fungsional | Tinggi |
| Barang sering tertukar karena tidak memiliki kode identitas | Sistem membuat kode barang dan nama barang | Fungsional | Tinggi |
| Kondisi barang sering tidak tercatat setelah dipinjam | Sistem mencatat kondisi barang sebelum dan sesudah peminjaman | Fungsional | Tinggi |
| Pengurus harus menunggu pencatatan manual saat peminjaman | Sistem menyediakan proses peminjaman digital berbasis web | Fungsional | Sedang |
| Peminjaman barang perlu persetujuan pengurus | Admin dapat menyetujui atau menolak permintaan peminjaman | Fungsional | Tinggi |
| Kesulitan mengetahui riwayat barang rusak atau diperbaiki | Sistem menyimpan riwayat maintenance dan kerusakan barang | Fungsional | Sedang |
| Laporan inventaris masih direkap manual | Sistem dapat mencetak dan mengekspor laporan PDF/Excel | Fungsional | Tinggi |
| Sistem harus bisa digunakan beberapa pengurus secara bersamaan | Sistem mendukung multi user dan akses online | Non fungsional | Tinggi |
| Data inventaris tidak boleh mudah hilang | Sistem memiliki penyimpanan database yang aman | Non fungsional | Tinggi |
| Pengurus organisasi tidak semuanya paham teknologi | Sistem memiliki tampilan sederhana dan mudah digunakan | Non fungsional | Sedang |
| Data harus dapat dicari dengan cepat | Sistem menyediakan fitur pencarian barang | Fungsional | Tinggi |
| Tidak semua pengguna boleh mengubah data inventaris | Sistem memiliki login dan hak akses admin/user | Fungsional | Tinggi |

---

# BAB III: ANALISIS KEBUTUHAN SISTEM

## 3.1 Kebutuhan Fungsional (Functional Requirements)
Berikut adalah hasil penerjemahan kebutuhan klien ke dalam kebutuhan fungsional sistem dalam bahasa teknis yang disesuaikan dengan hasil responsi:

| ID-FR | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- |
| FR-01 | Sistem dapat melakukan CRUD data inventaris barang secara terpusat. | Tinggi |
| FR-02 | Sistem mencatat identitas peminjam (berupa nama) dan status peminjaman barang. | Tinggi |
| FR-03 | Sistem membuat kode barang dan nama barang. | Tinggi |
| FR-04 | Sistem mencatat kondisi barang sebelum dan sesudah peminjaman. | Tinggi |
| FR-05 | Sistem menyediakan proses peminjaman digital berbasis web. | Sedang |
| FR-06 | Admin dapat menyetujui atau menolak permintaan peminjaman. | Tinggi |
| FR-07 | Sistem menyimpan riwayat maintenance dan kerusakan barang. | Sedang |
| FR-08 | Sistem dapat mencetak dan mengekspor laporan PDF/Excel. | Tinggi |
| FR-09 | Sistem menyediakan fitur pencarian barang. | Tinggi |
| FR-10 | Sistem memiliki login dan hak akses admin/user. | Tinggi |

## 3.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)
Berikut adalah kebutuhan non-fungsional sistem yang harus dipenuhi:

| ID-NFR | Kategori | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- | :--- |
| NFR-01 | Compatibility / Availability | Sistem mendukung multi user dan akses online. | Tinggi |
| NFR-02 | Security / Reliability | Sistem memiliki penyimpanan database yang aman untuk mencegah data mudah hilang. | Tinggi |
| NFR-03 | Usability | Sistem memiliki tampilan sederhana dan mudah digunakan (ramah bagi yang tidak paham teknologi). | Sedang |

---

# BAB IV: PEMODELAN AWAL (SCOPING)

## 4.1 Diagram Arsitektur Sistem
Sistem Informasi Inventaris Barang (SIBOS) dibangun menggunakan arsitektur berbasis web dengan pola client-server. Pengguna mengakses sistem melalui web browser yang terhubung ke web server. Web server memproses permintaan dan berkomunikasi dengan database server untuk menyimpan dan mengambil data inventaris.

Komponen utama arsitektur sistem meliputi:
- **Client Layer (Front-End)**: Merupakan lapisan antarmuka yang berinteraksi langsung dengan pengguna (Admin dan Anggota). Lapisan ini dibangun sebagai Single Page Application (SPA) menggunakan kerangka kerja REACT JS yang ditenagai oleh Vite untuk menghasilkan waktu muat (Loading time) yang sangat cepat. Penataan visual dan antarmuka pengguna diimplementasikan menggunakan pustaka Tailwind CSS.
- **Application Layer (Back-End)**: Merupakan web server yang menangani pemrosesan logika sistem, autentikasi, dan penyediaan jalur API. Lapisan ini dibangun menggunakan kerangka kerja Laravel 11 (PHP). Untuk menjamin stabilitas dan kemudahan implementasi, seluruh ekosistem server dijalankan secara terisolasi menggunakan teknologi kontainerisasi Docker.
- **Data Layer (Database)**: Merupakan peladen basis data (database server) yang digunakan untuk menyimpan seluruh entitas sistem secara terpusat. Basis data relasional yang digunakan adalah PostgreSQL, yang bertugas menyimpan data inventaris, riwayat peminjaman, data pengguna, dan rekapan laporan operasional.

Entitas luar (aktor) yang berinteraksi dengan sistem:
- **Admin (Bendahara/Logistik/Pengurus)**: Memiliki hak akses penuh untuk berinteraksi dengan sistem, meliputi manajemen data barang (CRUD), verifikasi/persutujuan peminjaman, konfirmasi pengembalian, dan pencetakan laporan.
- **User/Anggota**: Berinteraksi dengan sistem dalam lingkup hak akses terbatas, yaitu melihat daftar barang yang tersedia, melakukan peminjaman barang, dan melihat riwayat peminjaman pribadi.

*(Gambar 4.1 Diagram Arsitektur Sistem SIBOS)*

## 4.2 Daftar Aktor (User Role)
Berikut adalah daftar peran pengguna akhir dalam sistem SIBOS:

| User Role | Deskripsi Hak Akses |
| :--- | :--- |
| Admin | Memiliki akses penuh ke seluruh fitur sistem: manajemen data barang (CRUD), persetujuan peminjaman, konfirmasi pengembalian, pengelolaan user, pencatatan kondisi dan riwayat barang, serta ekspor laporan inventaris dan peminjaman. |
| User / Anggota | Memiliki akses terbatas: melihat daftar barang tersedia, mengajukan permintaan peminjaman, dan melakukan pengembalian barang. |

---

# BAB V: VERIFIKASI & VALIDASI

## 5.1 Pernyataan Persetujuan Klien
Daftar kebutuhan yang telah diidentifikasi di atas telah dikomunikasikan kepada pihak mitra UKM STIMBARA UISI untuk mendapatkan verifikasi dan validasi. Pihak mitra menyatakan bahwa kebutuhan-kebutuhan yang tercantum dalam dokumen ini telah sesuai dengan kebutuhan dan harapan mereka terhadap sistem yang akan dikembangkan.
Bukti persetujuan berupa surat kesediaan klien yang telah ditandatangani oleh perwakilan mitra terlampir pada bagian lampiran dokumen ini.

- **Nama Narasumber:** Miftahul Ulum
- **Jabatan:** Kepala Bidang Humas UKM STIMBARA UISI
- **Tanggal Verifikasi:** 04 Mei 2026
- **Status Persetujuan:** Disetujui
- **Bukti:** Surat kesediaan klien (terlampir)

## 5.2 Catatan Perubahan (Change Request Form)
Berikut adalah catatan perubahan kebutuhan yang terjadi selama proses elisitasi berlangsung:

| ID Perubahan | Deskripsi | Alasan | Dampak | Status |
| :--- | :--- | :--- | :--- | :--- |
| CR-01 | Penambahan fitur pencatatan kondisi barang setelah peminjaman. | Kebutuhan tambahan dari hasil observasi alur peminjaman | Menambah sub-fitur pada modul peminjaman (field kondisi saat kembali, notifikasi jika rusak). | Disetujui |
| CR-02 | Penambahan fitur riwayat maintenance dan kerusakan barang | Permintaan narasumber saat wawancara | Menambah 1 modul riwayat/maintenance barang (catatan perbaikan, biaya, tanggal) | Disetujui |
