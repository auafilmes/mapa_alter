mapboxgl.accessToken = 'SUA_CHAVE_MAPBOX_AQUI';

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

function limparMarcadores() {
  marcadores.forEach(m => m.remove());
  marcadores = [];
}

function renderizarLista(locais) {
  const lista = document.getElementById('local-list');
  lista.innerHTML = '';

  locais.forEach((l, i) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-${i}`;
    checkbox.dataset.index = i;
    checkbox.dataset.tipo = l.tipo;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        const marcador = new mapboxgl.Marker()
          .setLngLat([l.longitude, l.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${l.nome}</strong><p>${l.descricao}</p>`))
          .addTo(map);
        marcadores.push(marcador);
      } else {
        limparMarcadores();
        document.querySelectorAll('input[type=checkbox]:checked').forEach(el => {
          const i = el.dataset.index;
          const local = todosLocais[i];
          const marcador = new mapboxgl.Marker()
            .setLngLat([local.longitude, local.latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${local.nome}</strong><p>${local.descricao}</p>`))
            .addTo(map);
          marcadores.push(marcador);
        });
      }
    });

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = ` ${l.nome} (${l.tipo})`;

    const item = document.createElement('li');
    item.appendChild(checkbox);
    item.appendChild(label);
    lista.appendChild(item);
  });
}

document.getElementById('filtro').addEventListener('change', (e) => {
  limparMarcadores();
  const filtro = e.target.value;
  const locaisFiltrados = filtro === 'todas' ? todosLocais : todosLocais.filter(l => l.tipo === filtro);
  renderizarLista(locaisFiltrados);
});

fetch('pontos.js')
  .then(res => res.json())
  .then(locais => {
    todosLocais = locais;
    renderizarLista(todosLocais);
  });