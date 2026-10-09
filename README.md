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

1. Push proyek ke repository `haqiqien/personal-web`.
2. Buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**, pilih branch `main`, lalu pilih `/(root)` dan simpan.
4. Tunggu deployment selesai. Project site ini memakai custom domain akun `addien.ai.id` dengan path repository, sehingga URL-nya `https://addien.ai.id/personal-web/`.

### Netlify

1. Import repository melalui **Add new project → Import an existing project** atau unggah folder proyek melalui deploy manual.
2. Kosongkan **Build command** dan gunakan root proyek (`.`) sebagai **Publish directory**.
3. Deploy, lalu buka URL yang diberikan Netlify.

### Vercel

1. Import repository baru di Vercel.
2. Pilih **Other** sebagai Framework Preset, kosongkan **Build Command**, dan gunakan root proyek (`.`) sebagai **Output Directory**.
3. Deploy, lalu buka URL yang diberikan Vercel.

### Finalisasi URL publik

URL target project site dikonfigurasi sebagai `https://addien.ai.id/personal-web/`. Jika URL atau nama repository berubah, perbarui `siteUrl` di `js/config.js`, canonical, `og:url`, `og:image`, dan `twitter:image` di `index.html`, serta elemen `<loc>` di `sitemap.xml`.

`siteUrl` di `js/config.js` tidak mengubah metadata HTML statis. Canonical, Open Graph, Twitter, dan sitemap sudah memakai URL project site di atas. Pastikan URL publik untuk `assets/images/og-card.png` dapat dibuka, lalu cek halaman utama, metadata preview, tautan, dan console setelah deploy.

GitHub Pages project site berada di subpath `/personal-web/`, sedangkan crawler hanya membaca `robots.txt` dari root domain (`/robots.txt`) menurut [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html). Karena repository root domain adalah repository lain, `robots.txt` proyek ini tidak memuat directive sitemap dan tidak mengubah robots file situs root. Submit `https://addien.ai.id/personal-web/sitemap.xml` langsung ke Search Console bila diperlukan.

Proyek yang belum memiliki data nyata akan tetap menampilkan placeholder. Dalam kondisi itu, kriteria PRD untuk tautan demo dan repositori belum terpenuhi dan harus dianggap tertunda, bukan diganti dengan tautan contoh.

Rujukan resmi: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Netlify](https://docs.netlify.com/build/configure-builds/overview/), [Vercel](https://vercel.com/docs/builds/configure-a-build).
