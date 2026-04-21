# 📊 DaTabel

> **Ubah foto kertas tabel jadi file Excel dalam hitungan detik.**
> Tanpa input manual. Cukup foto. Sisanya serahkan pada AI mutakhir.

---

<img width="1920" height="1080" alt="Screenshot 2026-04-21 121138" src="https://github.com/user-attachments/assets/e2b669de-1127-467b-9fc2-7e101a9b2e84" />

---

## 🤖 Tentang Project

**DaTabel** hadir sebagai penyelamat bagi siapa saja yang lelah mengetik ulang baris data dari kertas ke komputer secara manual. Kami tidak hanya mengkonversi gambar; kami memberikan **waktu berharga** kembali kepada Anda.

Project ini lahir dari keresahan akan lambatnya proses administrasi dan _data entry_. Dibangun dengan fokus pada **Keakuratan** dan **Kecepatan** tingkat tinggi. Kami sangat mengerti bahwa menyalin ratusan baris data dari kuitansi, faktur, laporan cetak, atau buku tabungan adalah sebuah mimpi buruk. DaTabel adalah antitesis dari membuang-buang waktu tersebut.

### ✨ Fitur Utama

*   **📸 Unggah dan Jepret Langsung:** Mendukung multi-input, dari mulai file komputer hingga jepretan kamera _smartphone_ secara *real-time*.
*   **🧠 Ekstraksi AI Super Pintar (V2):** Ditenagai oleh *Generative AI* untuk membaca, mempelajari, lalu menstrukturkan tabel cetakan paling berantakan sekalipun dengan presisi tinggi.
*   **⚡ Konversi Massal Tanpa Lag:** Lapar data? Olah hingga **5 file dokumen** gambar/PDF sekaligus. Karena data besar tidak bisa menunggu.
*   **👀 Live Data Preview:** Cek, tinjau, dan pastikan data tabel sudah rapi di _browser_ tanpa harus mendownloadnya terlebih dahulu.
*   **📦 Unduhan Fleksibel & Cepat:** Dapatkan hasil bersih secara kilat dalam wujud *file* Excel (.csv). Jika mengolah banyak data? Kami satukan dalam paket `.zip`.
*   **📋 Salin Praktis (Copy-to-Clipboard):** Tinggal klik "Copy", lalu tempel (*paste*) sekejap mata pada Microsoft Excel atau Google Sheets.

---

## 🛠️ Tech Stack

Dapur project aplikasi super cepat ini dibangun menggunakan gabungan ekosistem dan teknologi web termodern tahun ini:

*   **Core:** [Next.js](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
*   **Styling Utama:** [Tailwind CSS v4](https://tailwindcss.com/) (Menghadirkan Dark/Light Theme yang memukau)
*   **Animasi:** [Framer Motion](https://www.framer.com/motion/) yang memastikan *micro-actions* berjalan sangat mulus
*   **Mesin Kecerdasan:** [Google GenAI](https://ai.google.dev/) API (The Brain of DaTabel)
*   **Utilitas Pendukung:** [JSZip](https://stuk.github.io/jszip/) (untuk ekstraksi ZIP seketika) & [Lenis](https://lenis.darkroom.engineering/) (Smooth Scroll UI)
*   **Ikonografi:** [Lucide React](https://lucide.dev/)

---

## 📂 Struktur Inti Project

```bash
.
├── app/
│   ├── api/                 # Jantung pemrosesan backend konversi file
│   ├── landing page/        # Pembangun UI utama (Komponen Hero, Fitur, dll)
│   ├── globals.css          # Basis tema penataan global (Tailwind)
│   ├── layout.tsx           # Kerangka metadata global web
│   └── page.tsx             # Pintu masuk utama untuk pengunjung
├── components/              # Komponen tambahan (Animations, Wrapper)
├── package.json             # Dokumentasi paket modul
└── README.md                # Anda ada di sini :)
```
