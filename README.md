# Peta Persebaran Kuil di Kota Kyoto, Jepang

WebGIS interaktif yang menampilkan persebaran 1.284 kuil (Buddha & Shinto) di Kota Kyoto, Jepang, berdasarkan data OpenStreetMap.

**Live Demo:** https://kuil-kyoto-webgis.vercel.app/*

---

## Informasi Proyek

| Item | Detail |
|------|--------|
| Mata Kuliah | Kapita Selekta Sistem Informasi (SIF610) |
| Universitas | Universitas Bakrie |
| Nama / NIM | Hosanna Jobel / 1242002046 |
| Wilayah Studi | Kota Kyoto, Jepang |
| Tema | Persebaran Kuil (Buddha & Shinto) |
| Sumber Data | OpenStreetMap via Overpass Turbo |
| Tahun Data | 2026 |

---

## Teknologi

- **Leaflet.js 1.9.4** — library peta interaktif open-source
- **OpenStreetMap & CartoDB** — basemap
- **Leaflet MarkerCluster** — clustering titik
- **GeoJSON** — format data spasial (1.284 titik kuil)
- **HTML5 / CSS3 / Vanilla JavaScript**

---

## Fitur

- Peta interaktif: zoom & pan
- 4 pilihan basemap: CartoDB Positron, OpenStreetMap, Satelit (Esri), Dark Mode
- Simbologi berjenjang (tier): kuil ikonik tampil besar dengan outline emas, kuil biasa tampil kecil
- Popup atribut: nama (Latin & Jepang), agama, tingkat kepentingan
- Filter berdasarkan agama (Buddha/Shinto) dan tingkat kepentingan (tier 1-4)
- Search bar: cari kuil berdasarkan nama Latin atau Jepang
- Statistik real-time yang ter-update saat filter berubah
- Marker clustering otomatis saat zoom out
- Legenda interaktif & responsive (mobile-friendly)

---

## Struktur Folder

```
kuil-kyoto-webgis/
├── index.html          # Halaman utama
├── style.css           # Styling
├── app.js              # Logika WebGIS
├── data/
│   └── kuil_kyoto.geojson   # Data spasial (1.284 kuil)
├── README.md
└── .gitignore
```

---

## Menjalankan Lokal

```bash
git clone https://github.com/USERNAME/kuil-kyoto-webgis.git
cd kuil-kyoto-webgis
python -m http.server 8000
# Buka http://localhost:8000 di browser
```

---

## Analisis Singkat

Persebaran 1.284 kuil di Kyoto membentuk tiga klaster utama: Higashiyama (timur), Arashiyama (barat), dan area utara. Mayoritas kuil ikonik berstatus warisan budaya terletak di kaki bukit/pinggiran kota, mencerminkan filosofi kuil sebagai tempat retreat yang tenang.

---

## Lisensi & Atribusi

- Data peta: © OpenStreetMap contributors (ODbL)
- Library: Leaflet (BSD-2-Clause), CartoDB basemap
- Dibuat untuk keperluan akademik di Universitas Bakrie.
