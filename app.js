/* =========================================================================
 *  WebGIS: Peta Persebaran Kuil di Kota Kyoto, Jepang
 *  Author : Hosanna Jobel (1242002046) - Universitas Bakrie
 *  Stack  : Leaflet.js + OpenStreetMap + GeoJSON
 *  Note   : Simbologi konsisten dengan peta statis QGIS (tier 1-4)
 * ======================================================================== */

// ===== 1. INISIALISASI PETA =====
const map = L.map("map", {
  center: [35.0116, 135.7681],
  zoom: 12,
  zoomControl: true,
});
map.zoomControl.setPosition("topright");
L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

// ===== 2. BASEMAP =====
const basemaps = {
  positron: L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OpenStreetMap, &copy; CARTO", maxZoom: 20 }
  ),
  osm: L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19 }
  ),
  satellite: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles &copy; Esri", maxZoom: 19 }
  ),
  dark: L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OpenStreetMap, &copy; CARTO", maxZoom: 20 }
  ),
};
let currentBasemap = basemaps.positron.addTo(map);
document.getElementById("basemapSelect").addEventListener("change", (e) => {
  map.removeLayer(currentBasemap);
  currentBasemap = basemaps[e.target.value].addTo(map);
});

// ===== 3. STYLING TITIK (KONSISTEN DENGAN PETA STATIS) =====
function getMarkerStyle(props) {
  const tier = props.tier;
  const isBuddhist = props.religion === "buddhist";

  // Warna & ukuran sesuai tier (sama dengan QML peta statis)
  let fillColor, radius, weight, strokeColor, fillOpacity;

  if (tier === 1) {
    fillColor = isBuddhist ? "#b11226" : "#e06a00";
    radius = 9; weight = 2.5; strokeColor = "#ffd60a"; fillOpacity = 1;
  } else if (tier === 2) {
    fillColor = isBuddhist ? "#d62828" : "#ef8a17";
    radius = 6.5; weight = 1.5; strokeColor = "#ffffff"; fillOpacity = 1;
  } else if (tier === 3) {
    fillColor = isBuddhist ? "#e86a6a" : "#f4b266";
    radius = 4.5; weight = 1; strokeColor = "#ffffff"; fillOpacity = 0.95;
  } else {
    fillColor = isBuddhist ? "#eba9a9" : "#f7d6a8";
    radius = 3; weight = 0; strokeColor = "#ffffff"; fillOpacity = 0.75;
  }

  return {
    radius, fillColor, color: strokeColor,
    weight, opacity: 1, fillOpacity,
  };
}

// ===== 4. POPUP HTML =====
function getName(props) {
  return props.label_en || props["name:en"] || props.name || "Tanpa Nama";
}
function getNameJp(props) {
  // tampilkan nama Jepang asli kalau berbeda dari label
  const jp = props.name;
  const en = props.label_en || props["name:en"];
  return jp && jp !== en ? jp : "";
}

function buildPopup(props) {
  const isBuddhist = props.religion === "buddhist";
  const religionLabel = isBuddhist
    ? '<span class="badge badge-buddhist">Buddha</span>'
    : '<span class="badge badge-shinto">Shinto</span>';

  const tierName = { 1: "Ikonik", 2: "Major", 3: "Notable", 4: "Reguler" }[props.tier] || "-";
  const tierBadge = props.tier === 1
    ? '<span class="badge badge-iconic">&#9733; Kuil Ikonik</span>'
    : tierName;

  const jp = getNameJp(props);

  return `
    <div class="popup-title">&#9962; ${getName(props)}</div>
    ${jp ? `<div class="popup-jp">${jp}</div>` : ""}
    <table class="popup-table">
      <tr><td>Agama</td><td>${religionLabel}</td></tr>
      <tr><td>Tingkat</td><td>${tierBadge}</td></tr>
      ${props.building && props.building !== "yes" ? `<tr><td>Bangunan</td><td>${props.building}</td></tr>` : ""}
    </table>
  `;
}

// ===== 5. LOAD GEOJSON =====
let allFeatures = [];
let geoLayer;
let clusterLayer = L.markerClusterGroup({
  maxClusterRadius: 40,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  disableClusteringAtZoom: 15,
});

fetch("data/kuil_kyoto.geojson")
  .then((res) => res.json())
  .then((data) => {
    // Normalisasi: ambil koordinat dari @geometry atau geometry
    allFeatures = data.features.map((f) => {
      if (!f.geometry && f["@geometry"]) f.geometry = f["@geometry"];
      return f;
    });
    renderLayer();
    updateStats();
    buildSearchIndex();
  })
  .catch((err) => {
    console.error("Gagal memuat GeoJSON:", err);
    alert("Gagal memuat data kuil. Pastikan file data/kuil_kyoto.geojson tersedia.");
  });

function renderLayer() {
  if (clusterLayer) { map.removeLayer(clusterLayer); clusterLayer.clearLayers(); }
  if (geoLayer) map.removeLayer(geoLayer);

  const filtered = applyFilters(allFeatures);
  const useCluster = document.getElementById("toggleCluster").checked;

  geoLayer = L.geoJSON(
    { type: "FeatureCollection", features: filtered },
    {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, getMarkerStyle(feature.properties)),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(buildPopup(feature.properties), { maxWidth: 280, minWidth: 200 });
        const nm = getName(feature.properties);
        if (feature.properties.tier <= 2) {
          layer.bindTooltip(nm, { direction: "top", offset: [0, -6] });
        }
      },
    }
  );

  if (useCluster) {
    clusterLayer.addLayer(geoLayer);
    map.addLayer(clusterLayer);
  } else {
    map.addLayer(geoLayer);
  }
}

// ===== 6. FILTER =====
function applyFilters(features) {
  const showBuddhist = document.getElementById("filterBuddhist").checked;
  const showShinto = document.getElementById("filterShinto").checked;
  const t1 = document.getElementById("filterT1").checked;
  const t2 = document.getElementById("filterT2").checked;
  const t3 = document.getElementById("filterT3").checked;
  const t4 = document.getElementById("filterT4").checked;
  const tierOk = { 1: t1, 2: t2, 3: t3, 4: t4 };

  return features.filter((f) => {
    const p = f.properties;
    if (p.religion === "buddhist" && !showBuddhist) return false;
    if (p.religion === "shinto" && !showShinto) return false;
    if (!tierOk[p.tier]) return false;
    return true;
  });
}

["filterBuddhist", "filterShinto", "filterT1", "filterT2", "filterT3", "filterT4", "toggleCluster"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    renderLayer();
    updateStats();
  });
});

// ===== 7. STATISTIK =====
function updateStats() {
  const filtered = applyFilters(allFeatures);
  const buddhist = filtered.filter((f) => f.properties.religion === "buddhist").length;
  const shinto = filtered.filter((f) => f.properties.religion === "shinto").length;
  document.getElementById("countBuddhist").textContent = buddhist;
  document.getElementById("countShinto").textContent = shinto;
  document.getElementById("countTotal").textContent = filtered.length;
}

// ===== 8. SEARCH =====
let searchIndex = [];
function buildSearchIndex() {
  searchIndex = allFeatures
    .filter((f) => getName(f.properties) !== "Tanpa Nama")
    .map((f) => ({
      name: getName(f.properties),
      jp: f.properties.name || "",
      coords: f.geometry.coordinates,
      feature: f,
    }));
}

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
searchInput.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  searchResults.innerHTML = "";
  if (q.length < 2) return;
  const matches = searchIndex
    .filter((it) => it.name.toLowerCase().includes(q) || it.jp.toLowerCase().includes(q))
    .slice(0, 10);
  matches.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${m.name}</strong>${m.jp && m.jp !== m.name ? ` <span style="color:#999">${m.jp}</span>` : ""}`;
    li.addEventListener("click", () => {
      map.setView([m.coords[1], m.coords[0]], 16);
      L.popup()
        .setLatLng([m.coords[1], m.coords[0]])
        .setContent(buildPopup(m.feature.properties))
        .openOn(map);
      searchResults.innerHTML = "";
      searchInput.value = m.name;
    });
    searchResults.appendChild(li);
  });
});

// ===== 9. TOGGLE SIDEBAR =====
document.getElementById("toggleSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("hidden");
  setTimeout(() => map.invalidateSize(), 320);
});

// ===== 10. LEGENDA DI PETA =====
const legendControl = L.control({ position: "bottomright" });
legendControl.onAdd = function () {
  const div = L.DomUtil.create("div", "leaflet-legend");
  div.style.cssText = "background:white;padding:8px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:12px;line-height:1.7";
  div.innerHTML = `
    <strong style="color:#8b1a1a">Legenda</strong><br>
    <span style="display:inline-block;width:13px;height:13px;background:#b11226;border:2px solid #ffd60a;border-radius:50%;margin-right:6px"></span>Kuil Buddha (ikonik)<br>
    <span style="display:inline-block;width:13px;height:13px;background:#e06a00;border:2px solid #ffd60a;border-radius:50%;margin-right:6px"></span>Kuil Shinto (ikonik)<br>
    <span style="display:inline-block;width:9px;height:9px;background:#eba9a9;border-radius:50%;margin-right:8px;margin-left:2px"></span>Kuil Buddha lainnya<br>
    <span style="display:inline-block;width:9px;height:9px;background:#f7d6a8;border-radius:50%;margin-right:8px;margin-left:2px"></span>Kuil Shinto lainnya
  `;
  return div;
};
legendControl.addTo(map);
