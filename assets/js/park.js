const zones = [
  { id: 'A 01', spots: [{s:'01',t:'free'},{s:'02',t:'free'},{s:'03',t:'neutral'},{s:'04',t:'free'},{s:'05',t:'occupied'},{s:'06',t:'occupied'},{s:'07',t:'free'},{s:'08',t:'free'}] },
  { id: 'C 01', spots: [{s:'01',t:'occupied'},{s:'02',t:'occupied'},{s:'03',t:'free'},{s:'04',t:'free'},{s:'05',t:'occupied'},{s:'06',t:'occupied'},{s:'07',t:'free'},{s:'08',t:'free'}] },
  { id: 'E 01', spots: [{s:'01',t:'free'},{s:'02',t:'free'},{s:'03',t:'free'},{s:'04',t:'free'},{s:'05',t:'occupied'},{s:'06',t:'occupied'},{s:'07',t:'free'},{s:'08',t:'free'}] },
  { id: 'F 01', spots: [{s:'01',t:'occupied'},{s:'02',t:'delete'},{s:'03',t:'free'},{s:'04',t:'neutral'},{s:'05',t:'occupied'},{s:'06',t:'free'}] },
  { id: 'B 01', spots: [{s:'01',t:'occupied'},{s:'02',t:'occupied'},{s:'03',t:'free'},{s:'04',t:'free'},{s:'05',t:'occupied'},{s:'06',t:'free'},{s:'07',t:'free'},{s:'08',t:'occupied'}] },
  { id: 'D 01', spots: [{s:'01',t:'occupied'},{s:'02',t:'free'},{s:'03',t:'occupied'},{s:'04',t:'free'},{s:'05',t:'free'},{s:'06',t:'occupied'},{s:'07',t:'free'},{s:'08',t:'free'}] },
  { id: 'F 01', spots: [{s:'01',t:'free'},{s:'02',t:'occupied'},{s:'03',t:'free'},{s:'04',t:'free'},{s:'05',t:'occupied'},{s:'06',t:'free'},{s:'07',t:'neutral'},{s:'08',t:'free'}] },
  { id: 'F 01', spots: [{s:'01',t:'free'},{s:'02',t:'free'},{s:'03',t:'neutral'},{s:'04',t:'neutral'}] },
];

const grid = document.getElementById('parkingGrid');

zones.forEach(zone => {
  const free = zone.spots.filter(s => s.t === 'free').length;
  const total = zone.spots.length;

  const card = document.createElement('div');
  card.className = 'zone-card';
  card.innerHTML = `
    <div class="zone-header">
      <span class="zone-label">${zone.id}</span>
      <span class="zone-stats">${free}/${total} libres</span>
    </div>
    <div class="spots-grid">
      ${zone.spots.map(spot => {
        const isDelete = spot.t === 'delete';
        const cls = isDelete ? 'occupied delete-hover' : spot.t;
        const car = spot.t === 'free' ? '🚗' : spot.t === 'neutral' ? '' : '🚙';
        return `<div class="spot ${cls}">
          <span class="car-icon">${car}</span>
          <span class="spot-num">${spot.s}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="zone-nav">
      <div class="nav-arrow">‹</div>
      <div class="nav-dots">
        <div class="nav-dot active"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
      </div>
      <div class="nav-arrow">›</div>
      <span style="font-size:11px;color:#aaa;margin-left:8px;">···</span>
    </div>
  `;
  grid.appendChild(card);
});