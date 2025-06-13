mapboxgl.accessToken = 'pk.eyJ1IjoiYXVhZmlsbWVzIiwiYSI6ImNtOHRscHZoazBjamsya3EwajV5cGkxODMifQ.w36wEtTElcFXKKnU3_SLUQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-54.9495, -2.5045],
  zoom: 15
});

let userMarker;
navigator.geolocation.getCurrentPosition((position) => {
  const userCoords = [position.coords.longitude, position.coords.latitude];
  userMarker = new mapboxgl.Marker({ color: 'blue' })
    .setLngLat(userCoords)
    .addTo(map);
}, () => alert("Não foi possível acessar sua localização."));

function tracarRota(destino) {
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

let todosLocais = [];
let marcadores = [];

function renderizarLocais(filtro) {
  const lista = document.getElementById('local-list');
  lista.innerHTML = '';
  marcadores.forEach(m => m.remove());
  marcadores = [];

  const locaisFiltrados = filtro === 'todas' ? todosLocais : todosLocais.filter(l => l.tipo === filtro);

  locaisFiltrados.forEach(l => {
    const el = document.createElement('li');
    el.textContent = `${l.nome} (${l.tipo})`;
    el.onclick = () => {
      new mapboxgl.Popup()
        .setLngLat([l.longitude, l.latitude])
        .setHTML(`<strong>${l.nome}</strong><p>${l.descricao}</p>`)
        .addTo(map);
      tracarRota([l.longitude, l.latitude]);
    };
    lista.appendChild(el);

    const marcador = new mapboxgl.Marker()
      .setLngLat([l.longitude, l.latitude])
      .addTo(map);
    marcadores.push(marcador);
  });
}

fetch('pontos.js')
  .then(res => res.json())
  .then(locais => {
    todosLocais = locais;
    renderizarLocais('todas');
  });

document.getElementById('filtro').addEventListener('change', (e) => {
  renderizarLocais(e.target.value);
});
