mapboxgl.accessToken = 'pk.eyJ1IjoiYXVhZmlsbWVzIiwiYSI6ImNtOHRscHZoazBjamsya3EwajV5cGkxODMifQ.w36wEtTElcFXKKnU3_SLUQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-54.9495, -2.5045], // Centro Alter do Chão
  zoom: 15
});

let userMarker;
navigator.geolocation.getCurrentPosition((position) => {
  const userCoords = [position.coords.longitude, position.coords.latitude];
  userMarker = new mapboxgl.Marker({ color: 'blue' })
    .setLngLat(userCoords)
    .addTo(map);
}, () => alert("Não foi possível acessar sua localização."));

function traçarRota(destino) {
  navigator.geolocation.getCurrentPosition((position) => {
    const origem = [position.coords.longitude, position.coords.latitude];
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origem[0]},${origem[1]};${destino[0]},${destino[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
      .then(res => res.json())
      .then(data => {
        const rota = data.routes[0].geometry;
        map.getSource('rota')?.setData(rota) || map.addSource('rota', {
          type: 'geojson', data: rota
        });
        map.getLayer('rota') || map.addLayer({
          id: 'rota', type: 'line', source: 'rota',
          paint: { 'line-color': '#3b9ddd', 'line-width': 5 }
        });
      });
  });
}

fetch('pontos.js')
  .then(res => res.json())
  .then(locais => {
    const lista = document.getElementById('local-list');
    locais.forEach(l => {
      const el = document.createElement('li');
      el.textContent = `${l.nome} (${l.tipo})`;
      el.onclick = () => {
        new mapboxgl.Popup().setLngLat([l.longitude, l.latitude]).setHTML(`<strong>${l.nome}</strong><p>${l.descricao}</p>`).addTo(map);
        traçarRota([l.longitude, l.latitude]);
      };
      lista.appendChild(el);
      new mapboxgl.Marker().setLngLat([l.longitude, l.latitude]).addTo(map);
    });
  });
