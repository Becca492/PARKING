const ctx = document.getElementById('forfaitChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Sem 1','Sem 2','Sem 3','Sem 4'],
    datasets: [
      {
        label: 'Forfait Horaire',
        data: [15, 30, 20, 38],
        borderColor: '#2a4a3d',
        backgroundColor: 'rgba(42,74,61,.08)',
        tension: 0.45,
        pointBackgroundColor: '#2a4a3d',
        pointRadius: 5,
        fill: false,
        borderWidth: 2.5,
      },
      {
        label: 'Forfait Journée',
        data: [22, 18, 35, 28],
        borderColor: '#6e7848',
        backgroundColor: 'rgba(110,120,72,.08)',
        tension: 0.45,
        pointBackgroundColor: '#6e7848',
        pointRadius: 5,
        fill: false,
        borderWidth: 2.5,
      },
       {
        label: 'Forfait Semaine',
        data: [10, 25, 22, 15],
        borderColor: '#a0a080',
        backgroundColor: 'rgba(160,160,128,.06)',
        tension: 0.45,
        pointBackgroundColor: '#a0a080',
        pointRadius: 5,
        fill: false,
        borderWidth: 2,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { family: 'Outfit', size: 11 } } },
      y: {
        min: 0, max: 40,
        grid: { color: 'rgba(0,0,0,.05)' },
        ticks: { stepSize: 10, font: { family: 'Outfit', size: 11 } }
      }
    }
      }
})