# Portofolio Juyus Muhammad Adinulhaq

Situs portofolio statis dengan HTML, CSS, dan JavaScript vanilla. Tidak ada proses build atau dependensi runtime.

## Menjalankan secara lokal

Dari folder proyek, jalankan server statis:

```sh
python3 -m http.server 8080
```

Di Windows, gunakan `python -m http.server 8080`. Buka `http://localhost:8080` di browser.

## Mengubah konten

- Edit `js/data.js` untuk proyek, kelompok keahlian, hobi, dan peran.
- Edit `js/config.js` untuk email, tautan sosial, username GitHub, URL situs, dan feature flags.
- Isi username GitHub sebelum mengaktifkan data profil. Canonical memakai URL relatif sehingga mengikuti domain dan jalur deployment.

## Deploy

Situs ini tidak memerlukan build command atau dependensi runtime. Root publikasi harus berisi `index.html`, folder `css/`, `js/`, dan `assets/`.

### GitHub Pages

1. Push proyek ke repository GitHub.
2. Buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**, pilih branch publikasi, lalu pilih `/(root)` dan simpan.
4. Tunggu deployment selesai. URL situs muncul di halaman Pages. Untuk project site, URL biasanya menyertakan nama repository sebagai subpath; gunakan URL lengkap tersebut untuk metadata dan sitemap.

### Netlify

1. Import repository melalui **Add new project → Import an existing project** atau unggah folder proyek melalui deploy manual.
2. Kosongkan **Build command** dan gunakan root proyek (`.`) sebagai **Publish directory**.
3. Deploy, lalu buka URL yang diberikan Netlify.

### Vercel

1. Import repository baru di Vercel.
2. Pilih **Other** sebagai Framework Preset, kosongkan **Build Command**, dan gunakan root proyek (`.`) sebagai **Output Directory**.
3. Deploy, lalu buka URL yang diberikan Vercel.

### Finalisasi URL publik

Setelah URL produksi diketahui, gunakan URL dasar lengkap dengan garis miring penutup. Untuk GitHub Pages project site, URL dasar harus menyertakan subpath repository. Perbarui nilai `{{SITE_URL}}` di `og:url`, `og:image`, `twitter:image` pada `index.html`, serta elemen `<loc>` di `sitemap.xml`. Ganti `href` canonical dengan URL dasar itu. Tambahkan baris `Sitemap: https://domain-anda/sitemap.xml` ke `robots.txt` menggunakan URL final yang sama.

`siteUrl` di `js/config.js` tidak mengubah metadata HTML statis. Domain target yang saat ini dikonfigurasi adalah `https://haqiqien.github.io/`; canonical, Open Graph, Twitter, sitemap, dan robots perlu diperbarui secara manual jika domain berubah. Pastikan URL publik untuk `assets/images/og-card.png` dapat dibuka, lalu cek halaman utama, metadata preview, tautan, dan console setelah deploy.

Proyek yang belum memiliki data nyata akan tetap menampilkan placeholder. Dalam kondisi itu, kriteria PRD untuk tautan demo dan repositori belum terpenuhi dan harus dianggap tertunda, bukan diganti dengan tautan contoh.

Rujukan resmi: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Netlify](https://docs.netlify.com/build/configure-builds/overview/), [Vercel](https://vercel.com/docs/builds/configure-a-build).
