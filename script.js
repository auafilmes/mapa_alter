// ✅ COLE AQUI SUA CHAVE DO MAPBOX
mapboxgl.accessToken = 'SUA_CHAVE_PUBLICA_DO_MAPBOX';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-54.9495, -2.5045], // Centro de Alter do Chão
  zoom: 15
});

// Adiciona marcador do usuário (localização atual)
let userMarker;
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const userCoords = [pos.coords.longitude, pos.coords.latitude];
    userMarker = new mapboxgl.Marker({ color: 'blue' })
      .setLngLat(userCoords)
      .addTo(map);
  },
  () => alert("Não foi possível acessar sua localização.")
);

// Desenha a rota até um ponto selecionado
function tracarRota(destino) {
  navigator.geolocation.getCurrentPosition((pos) => {
    const origem = [pos.coords.longitude, pos.coords.latitude];
    const rotaURL = `https://api.mapbox.com/directions/v5/mapbox/driving/${origem[0]},${origem[1]};${destino[0]},${destino[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(rotaURL)
      .then(res => res.json())
      .then(data => {
        const rota = data.routes[0].geometry;

        if (map.getSource('rota')) {
          map.getSource('rota').setData(rota);
        } else {
          map.addSource('rota', {
            type: 'geojson',
            data: rota
          });
          map.addLayer({
            id: 'rota',
            type: 'line',
            source: 'rota',
            paint: {
              'line-color': '#3887be',
              'line-width': 5
            }
          });
        }
      });
  });
}

// Carrega e exibe os pontos do arquivo pontos.js
fetch('pontos.js')
  .then(res => res.json())
  .then(locais => {
    const lista = document.getElementById('local-list');

    locais.forEach(l => {
      // Adiciona marcador no mapa
      new mapboxgl.Marker()
        .setLngLat([l.longitude, l.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${l.nome}</strong><p>${l.descricao}</p>`))
        .addTo(map);

      // Adiciona item na lista lateral
      const item = document.createElement('li');
      item.textContent = `${l.nome} (${l.tipo})`;
      item.onclick = () => tracarRota([l.longitude, l.latitude]);
      lista.appendChild(item);
    });
  });
