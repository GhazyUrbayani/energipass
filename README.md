<div align="center">

  <h1>🌱 EnergiPass</h1>
  <p><strong>Green Vendor Passport for Indonesia’s Energy Supply Chain</strong></p>
  <p>Kenali gap persyaratan, telusuri evidence, dan tinjau kesiapan tender dalam satu dashboard.</p>

  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&amp;logo=html5&amp;logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&amp;logo=css&amp;logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&amp;logo=javascript&amp;logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Status-MVP_Demo-176C66?style=for-the-badge" alt="Status: MVP Demo" />

  <p>
    <a href="#tentang-proyek">Tentang</a> ·
    <a href="#menjalankan-secara-lokal">Mulai</a> ·
    <a href="#alur-demo">Alur Demo</a> ·
    <a href="https://github.com/GhazyUrbayani/energipass/issues">Laporkan Masalah</a>
  </p>

</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Alur Demo](#alur-demo)
- [Data dan Batasan MVP](#data-dan-batasan-mvp)
- [Hosting](#hosting)
- [Kontribusi](#kontribusi)
- [Pengembang dan Lisensi](#pengembang-dan-lisensi)

---

## Tentang Proyek

**EnergiPass** adalah MVP dashboard untuk membantu vendor dalam rantai pasok energi Indonesia meninjau persyaratan tender dan dokumen pendukung (*evidence*). Aplikasi memetakan kebutuhan tender terhadap evidence, menampilkan gap yang perlu ditindaklanjuti, serta merangkum kesiapan paket per kategori.

### Masalah

Persiapan tender membutuhkan pemeriksaan banyak jenis dokumen: legalitas perusahaan, sertifikasi teknis, HSE, TKDN, ESG, dan pengalaman proyek. Saat persyaratan dan evidence ditinjau terpisah, dokumen yang belum tersedia, kedaluwarsa, atau perlu diperiksa ulang lebih sulit terlihat.

### Solusi

EnergiPass menyatukan **persyaratan → evidence → status → tindakan** dalam satu alur. Pengguna dapat memilih tender, menelusuri sumber dan versi evidence, lalu melihat kategori yang masih memerlukan perhatian sebelum pengajuan.

> **Status proyek: demo frontend dengan data fiktif.** EnergiPass tidak menggantikan CIVD, Buyer VMS, atau sistem pengadaan resmi. Kualifikasi dan pengajuan tetap mengikuti ketentuan buyer melalui sistem resminya.

## Fitur Utama

| Modul | Kemampuan |
| --- | --- |
| **Beranda** | Tender aktif, tenggat, ringkasan status, daftar tindakan prioritas, dan aktivitas evidence demo. |
| **Tender Gap Checker** | Pencarian persyaratan atau evidence, filter status, serta tabel sumber dan masa berlaku. |
| **Evidence Library** | Pencarian dokumen, filter kategori/status/masa berlaku, dan panel detail evidence. |
| **Paket Tender** | Ringkasan kesiapan per kategori dan simulasi **Siapkan Paket**. |
| **Pergantian Tender** | Dua skenario fiktif: EPC Solar Project A dan Turbine Overhaul B. |
| **Traceability** | Metadata sumber, referensi, versi, tanggal efektif, masa berlaku, dan pembaruan terakhir. |

Antarmuka responsif dilengkapi label form, tabel semantik, skip link, indikator fokus keyboard, dan teks status selain warna.

### Status Kesiapan

| Status | Arti dalam demo |
| --- | --- |
| **Ready** | Persyaratan ditandai siap pada data contoh. |
| **Missing** | Evidence belum tersedia atau belum ditautkan. |
| **Expired** | Evidence ditandai kedaluwarsa pada data contoh. |
| **Needs Review** | Evidence perlu dicocokkan kembali dengan persyaratan tender. |

## Tech Stack

| Komponen | Teknologi |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3, CSS custom properties, Grid, dan Flexbox |
| Interaksi | JavaScript murni dan DOM API |
| Data demo | Objek JavaScript dalam `mock-data.js` |
| State dan navigasi | State di memori browser; pergantian tampilan dalam satu halaman |
| Server lokal | HTTP server bawaan Python 3 |
| Build untuk hosting | Node.js 22+ dan npm; menyalin asset statis ke `dist/` |
| Deployment | Cloudflare Workers Static Assets dan Wrangler 4 |

Aplikasi berjalan tanpa library npm, backend, database, API key, atau file `.env`. Browser langsung memuat HTML, CSS, dan JavaScript. Build opsional untuk hosting menggunakan Node.js dan npm tanpa instalasi dependensi aplikasi.

## Struktur Proyek

```text
energipass/
├── .github/
│   └── workflows/
│       └── deploy.yml  # Build dan deployment Cloudflare Workers
├── scripts/
│   └── build.mjs       # Menyalin empat asset aplikasi ke dist/
├── .gitattributes      # Pengaturan Git
├── .gitignore          # File lokal yang diabaikan Git
├── .node-version       # Node.js 22 untuk build
├── index.html          # Kerangka aplikasi, navigasi, drawer, dan panduan
├── styles.css          # Tema, komponen, responsivitas, dan fokus keyboard
├── mock-data.js        # Vendor, tender, persyaratan, evidence, dan aktivitas demo
├── app.js              # State, rendering halaman, pencarian, filter, dan interaksi
├── package.json        # Perintah npm run build; tanpa dependensi aplikasi
├── wrangler.jsonc      # Konfigurasi Workers Static Assets
├── dist/               # Hasil build; dibuat otomatis dan diabaikan Git
└── README.md           # Dokumentasi proyek
```

## Menjalankan Secara Lokal

### Prasyarat

- Browser modern seperti Chrome, Firefox, Edge, atau Safari.
- **Python 3** untuk menjalankan server lokal.
- **Git** jika ingin mengambil proyek melalui clone; unduhan ZIP juga dapat digunakan.

### 1. Ambil Proyek

```bash
git clone https://github.com/GhazyUrbayani/energipass.git
cd energipass
```

Jika proyek sudah diunduh, buka terminal pada folder `energipass` yang berisi `index.html`.

### 2. Jalankan Server

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Pada Windows, gunakan `py -3 -m http.server 4173 --bind 127.0.0.1` jika perintah `python3` tidak tersedia.

### 3. Buka Aplikasi

Buka **[http://localhost:4173](http://localhost:4173)**. Tidak diperlukan instalasi paket atau konfigurasi tambahan. Tekan `Ctrl+C` pada terminal untuk menghentikan server.

Jika port `4173` sedang digunakan, ganti dengan port lain, misalnya `4174`, lalu buka alamat dengan port yang sama.

## Alur Demo

1. Di **Beranda**, pilih tender aktif dan lihat ringkasan **Ready**, **Missing**, **Expired**, serta **Needs Review**.
2. Klik **Periksa Tender** untuk melihat persyaratan. Gunakan pencarian atau filter status untuk menemukan gap.
3. Klik **Lihat** pada evidence yang ditautkan untuk memeriksa sumber, referensi, versi, dan masa berlakunya.
4. Buka **Evidence** untuk menelusuri seluruh metadata dokumen menurut kategori, status, atau masa berlaku.
5. Buka **Paket Tender**, tinjau kesiapan per kategori, lalu klik **Siapkan Paket** untuk melihat konfirmasi simulasi.
6. Ganti tender untuk membandingkan kebutuhan skenario EPC Solar dengan Turbine Overhaul.

Tombol **Tambah Evidence** belum mengunggah atau menyimpan dokumen. Tombol tersebut mengarahkan pengguna ke halaman Evidence atau menampilkan informasi bahwa penambahan belum tersedia.

## Data dan Batasan MVP

Dataset dalam `mock-data.js` mencakup **1 vendor fiktif**, **2 tender**, **35 persyaratan** (27 + 8), dan **23 entri metadata evidence**. Kategorinya meliputi Legal, Teknis, HSE, TKDN, ESG, dan Pengalaman proyek.

- **Seluruh data adalah contoh.** Nama perusahaan, buyer, tender, referensi, dan aktivitas tidak mewakili transaksi atau verifikasi nyata.
- **Dokumen berupa metadata.** Nama berakhiran `.pdf` adalah label contoh; repository tidak menyertakan file dokumen tersebut.
- **Status dan tanggal bersifat statis.** Masa berlaku, status kesiapan, aktivitas, dan waktu konfirmasi paket mengikuti data demo, tanpa validasi otomatis terhadap tanggal saat ini.
- **Belum ada penyimpanan permanen.** Pilihan tender, filter, dan konfirmasi paket berada di memori browser dan kembali ke kondisi awal saat halaman dimuat ulang.
- **Paket tender masih simulasi.** Aksi **Siapkan Paket** menampilkan ringkasan; belum menghasilkan PDF, ZIP, unduhan, atau pengajuan tender.
- **Belum ada integrasi eksternal.** Label seperti “Buyer VMS” hanya menunjukkan sumber contoh dan tidak menyatakan koneksi, sinkronisasi, atau dukungan dari sistem tersebut.

Untuk mengubah skenario demo, edit `mock-data.js` dan pertahankan hubungan ID antara tender, persyaratan, dan evidence. Muat ulang browser setelah mengubah file.

## Hosting

### Build Asset Statis

Dengan **Node.js 22+** dan **npm**, jalankan dari root repository:

```bash
npm run build
```

Perintah ini menyiapkan `dist/` berisi `index.html`, `styles.css`, `mock-data.js`, dan `app.js`. Tidak perlu `npm install` untuk build. Folder hasil build dibersihkan setiap kali perintah dijalankan; simpan perubahan pada file sumber.

Untuk memeriksa hasil build secara lokal:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Jika menambahkan gambar, font, atau asset lain, sertakan juga dalam daftar `assets` di [`scripts/build.mjs`](scripts/build.mjs).

### Cloudflare Workers Builds

Konfigurasi [`wrangler.jsonc`](wrangler.jsonc) menyajikan `dist/` melalui **Workers Static Assets**. Atur proyek yang terhubung ke GitHub di **Settings → Build**:

| Pengaturan | Nilai |
| --- | --- |
| Repository | `GhazyUrbayani/energipass` |
| Production branch | `main` |
| Root directory | Root repository (`/`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler@4 deploy` |
| Nama Worker | `energipass`, sesuai `name` di `wrangler.jsonc` |

Jika nama Worker pada Cloudflare berbeda, sesuaikan `name` di `wrangler.jsonc` dengan nama tersebut. Commit dan push file konfigurasi serta sumber aplikasi, lalu jalankan ulang build Cloudflare. `dist/` tidak perlu diunggah ke Git karena dibuat oleh build.

Pengaturan build dan deploy mengikuti [dokumentasi Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), sedangkan direktori asset mengikuti [dokumentasi Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/binding/).

### GitHub Actions

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) menyediakan jalur deployment melalui GitHub Actions: menyiapkan Node.js, menjalankan build, lalu memanggil Wrangler 4. Jalur ini memerlukan secret repository `CLOUDFLARE_API_TOKEN` yang memiliki akses ke akun Cloudflare tujuan. Jika menggunakan Workers Builds, workflow GitHub Actions tidak wajib; pilih satu jalur otomatis agar setiap push tidak memicu dua deployment.

Untuk layanan hosting statis lain, gunakan `npm run build` sebagai build command dan `dist` sebagai direktori output. URL demo publik belum dicantumkan dalam dokumentasi.

## Kontribusi

Perbaikan dokumentasi, aksesibilitas, antarmuka, dan skenario demo dapat diajukan melalui issue atau pull request.

1. Fork repository dan buat branch untuk perubahan.
2. Sesuaikan file terkait; gunakan data fiktif untuk contoh dokumen dan perusahaan.
3. Jalankan aplikasi secara lokal dan periksa keempat halaman, pergantian tender, pencarian/filter, panel detail evidence, serta simulasi paket pada ukuran desktop dan seluler.
4. Buka pull request dengan penjelasan perubahan dan hasil pemeriksaan.

## Pengembang dan Lisensi

Dikembangkan oleh **[Ghazy Urbayani](https://github.com/GhazyUrbayani)**.

Repository ini belum menyertakan berkas `LICENSE`; lisensi proyek belum dicantumkan.

---

<div align="center">
  <strong>EnergiPass · Green Vendor Passport</strong><br />
  <sub>Membantu vendor meninjau kesiapan evidence sebelum pengajuan tender.</sub>
</div>
