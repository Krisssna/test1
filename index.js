// Full-screen toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    const chartContainer = document.getElementById('chartContainer');
    const chartCanvas = document.getElementById('myChart');

    if (!fullscreenToggle || !chartContainer || !chartCanvas) {
        console.error('Fullscreen toggle, chart container, or canvas not found in DOM');
        return;
    }

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && window.innerHeight <= 1024);
    }

    fullscreenToggle.addEventListener('click', function() {
        const isMobileDevice = isMobile();
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
            if (chartContainer.requestFullscreen) {
                chartContainer.requestFullscreen().then(() => {
                    if (isMobileDevice) {
                        chartCanvas.style.height = '80vh';
                        if (currentChart) currentChart.resize();
                    }
                }).catch(err => console.error('Error enabling fullscreen:', err));
            } else if (chartContainer.webkitRequestFullscreen) {
                chartContainer.webkitRequestFullscreen().then(() => {
                    if (isMobileDevice) {
                        chartCanvas.style.height = '95vh';
                        if (currentChart) currentChart.resize();
                    }
                }).catch(err => console.error('Webkit fullscreen error:', err));
            } else if (chartContainer.mozRequestFullScreen) {
                chartContainer.mozRequestFullScreen().then(() => {
                    if (isMobileDevice) {
                        chartCanvas.style.height = '80vh';
                        if (currentChart) currentChart.resize();
                    }
                }).catch(err => console.error('Mozilla fullscreen error:', err));
            } else if (chartContainer.msRequestFullscreen) {
                chartContainer.msRequestFullscreen().then(() => {
                    if (isMobileDevice) {
                        chartCanvas.style.height = '80vh';
                        if (currentChart) currentChart.resize();
                    }
                }).catch(err => console.error('MS fullscreen error:', err));
            }
        } else {
            const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
            if (exitFullscreen) {
                exitFullscreen.call(document).then(() => {
                    if (isMobileDevice) {
                        chartCanvas.style.height = '';
                        if (currentChart) currentChart.resize();
                    }
                });
            }
        }
    });

    // Details toggle
    const detailsToggle = document.getElementById('detailsToggle');
    if (detailsToggle) {
        detailsToggle.addEventListener('click', function() {
            if (currentChart) {
                currentChart.options.showDetails = !currentChart.options.showDetails;
                this.classList.toggle('active', currentChart.options.showDetails);
                console.log('Show Details toggled to:', currentChart.options.showDetails);
                currentChart.update('none');
            } else {
                console.error('Chart not initialized when toggling Details');
            }
        });
    } else {
        console.error('Details toggle not found in DOM');
    }
});

let currentChart = null;
let columns = 3;
let rows = 3;
const maxColumns = 100;
const maxRows = 500;
const minColumns = 1;
const minRows = 1;
const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

function initializeTable() {
    updateTableStructure();
    updateChart();
}

function updateTableStructure() {
    const header = document.getElementById('excelHeader');
    const body = document.getElementById('excelBody');
    
    header.innerHTML = '';
    body.innerHTML = '';
    
    let timeTh = document.createElement('th');
    let timeInputHeader = document.createElement('input');
    timeInputHeader.type = 'text';
    timeInputHeader.value = 'Time';
    timeTh.appendChild(timeInputHeader);
    header.appendChild(timeTh);
    
    for (let i = 0; i < columns; i++) {
        let columnTh = document.createElement('th');
        let columnControlsDiv = document.createElement('div');
        columnControlsDiv.className = 'column-controls';
    
        let addButton = document.createElement('button');
        addButton.className = 'addButton';
        addButton.textContent = '+';
        addButton.onclick = function () { addColumnAfter(this); };
    
        let deleteButton = document.createElement('button');
        deleteButton.className = 'delButton';
        deleteButton.textContent = '-';
        deleteButton.onclick = function () { deleteColumn(this); };
    
        columnControlsDiv.appendChild(addButton);
        columnControlsDiv.appendChild(deleteButton);
        columnTh.appendChild(columnControlsDiv);
    
        let columnInput = document.createElement('input');
        columnInput.type = 'text';
        columnInput.value = 'Series ' + (i + 1);
        columnTh.appendChild(columnInput);
    
        header.appendChild(columnTh);
    }
    
    for (let i = 0; i < rows; i++) {
        let newRow = document.createElement('tr');
    
        let timeTd = document.createElement('td');
        timeTd.style.position = 'relative';
    
        let rowControlsDiv = document.createElement('div');
        rowControlsDiv.className = 'row-controls';
        rowControlsDiv.style.display = 'none';
        rowControlsDiv.style.position = 'absolute';
        rowControlsDiv.style.left = '-10px';
        rowControlsDiv.style.top = '50%';
        rowControlsDiv.style.transform = 'translateY(-50%)';
        rowControlsDiv.style.flexDirection = 'column';
    
        let addRowButton = document.createElement('button');
        addRowButton.className = 'addButton';
        addRowButton.textContent = '+';
        addRowButton.onclick = function () { addRowAfter(this); };
    
        let deleteRowButton = document.createElement('button');
        deleteRowButton.className = 'delButton';
        deleteRowButton.textContent = '-';
        deleteRowButton.onclick = function () { deleteSpecificRow(this); };
    
        rowControlsDiv.appendChild(addRowButton);
        rowControlsDiv.appendChild(deleteRowButton);
    
        timeTd.appendChild(rowControlsDiv);
    
        timeTd.addEventListener('mouseenter', function() { rowControlsDiv.style.display = 'flex'; });
        timeTd.addEventListener('mouseleave', function() { rowControlsDiv.style.display = 'none'; });
    
        let timeInput = document.createElement('input');
        timeInput.type = 'number';
        timeInput.value = i + 1;
        timeTd.appendChild(timeInput);
        newRow.appendChild(timeTd);
    
        for (let j = 0; j < columns; j++) {
            let dataTd = document.createElement('td');
            let dataInput = document.createElement('input');
            dataInput.type = 'number';
            dataInput.value = Math.sin(i + j) * 10;
            dataTd.appendChild(dataInput);
            newRow.appendChild(dataTd);
        }
    
        body.appendChild(newRow);
    }
}

function addRowAfter(button) {
  const row = button.closest('tr');
  const body = document.getElementById('excelBody');
  const newRow = document.createElement('tr');
  
  let timeTd = document.createElement('td');
  timeTd.style.position = 'relative';
  
  let rowControlsDiv = document.createElement('div');
  rowControlsDiv.className = 'row-controls';
  rowControlsDiv.style.display = 'none';
  rowControlsDiv.style.position = 'absolute';
  rowControlsDiv.style.left = '-20px';
  rowControlsDiv.style.top = '50%';
  rowControlsDiv.style.transform = 'translateY(-50%)';
  rowControlsDiv.style.flexDirection = 'column';
  
  let addRowButton = document.createElement('button');
  addRowButton.className = 'addButton';
  addRowButton.textContent = '+';
  addRowButton.onclick = function () {
    addRowAfter(this);
  };
  
  let deleteRowButton = document.createElement('button');
  deleteRowButton.className = 'delButton';
  deleteRowButton.textContent = '-';
  deleteRowButton.onclick = function () {
    deleteSpecificRow(this);
  };
  
  rowControlsDiv.appendChild(addRowButton);
  rowControlsDiv.appendChild(deleteRowButton);
  
  timeTd.appendChild(rowControlsDiv);
  
  timeTd.addEventListener('mouseenter', function() {
    rowControlsDiv.style.display = 'flex';
  });
  timeTd.addEventListener('mouseleave', function() {
    rowControlsDiv.style.display = 'none';
  });
  
  let timeInput = document.createElement('input');
  timeInput.type = 'number';
  timeInput.value = rows + 1;
  timeTd.appendChild(timeInput);
  newRow.appendChild(timeTd);
  
  for (let j = 0; j < columns; j++) {
    let dataTd = document.createElement('td');
    let dataInput = document.createElement('input');
    dataInput.type = 'number';
    dataInput.value = 0;
    dataTd.appendChild(dataInput);
    newRow.appendChild(dataTd);
  }
  
  body.insertBefore(newRow, row.nextSibling);
  rows++;
  updateChart();
}

function deleteSpecificRow(button) {
  const row = button.closest('tr');
  const body = document.getElementById('excelBody');
  
  if (rows > minRows) {
    row.remove();
    rows--;
    updateChart();
  } else {
    alert('Minimum rows reached (1)');
  }
}

function addColumnAfter(button) {
  const th = button.closest('th');
  const header = document.getElementById('excelHeader');
  const index = Array.from(header.children).indexOf(th);
  
  if (columns >= maxColumns) {
    alert('Maximum columns reached (100)');
    return;
  }
  
  const newTh = document.createElement('th');
  const columnControlsDiv = document.createElement('div');
  columnControlsDiv.className = 'column-controls';
  
  const addButton = document.createElement('button');
  addButton.className = 'addButton';
  addButton.textContent = '+';
  addButton.onclick = function () {
    addColumnAfter(this);
  };
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delButton';
  deleteButton.textContent = '-';
  deleteButton.onclick = function () {
    deleteColumn(this);
  };
  
  columnControlsDiv.appendChild(addButton);
  columnControlsDiv.appendChild(deleteButton);
  newTh.appendChild(columnControlsDiv);
  
  const columnInput = document.createElement('input');
  columnInput.type = 'text';
  columnInput.value = 'Name';
  newTh.appendChild(columnInput);
  
  header.insertBefore(newTh, header.children[index + 1] || null);
  
  document.querySelectorAll('#excelBody tr').forEach(row => {
    const newTd = document.createElement('td');
    const newInput = document.createElement('input');
    newInput.type = 'number';
    newInput.value = 0;
    newTd.appendChild(newInput);
    row.insertBefore(newTd, row.children[index + 1]);
  });
  
  columns++;
  updateChart();
}

function deleteColumn(button) {
  const th = button.closest('th');
  const header = document.getElementById('excelHeader');
  const index = Array.from(header.children).indexOf(th);
  
  if (columns <= minColumns) {
    alert('Minimum columns reached (1)');
    return;
  }
  
  th.remove();
  
  document.querySelectorAll('#excelBody tr').forEach(row => {
    row.children[index].remove();
  });
  
  columns--;
  updateChart();
}

function getTableData() {
    const data = [];
    document.querySelectorAll('#excelBody tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('input[type="number"]').forEach((input, index) => {
            if (index > 0) { // Skip the first column (Time)
                rowData.push(parseFloat(input.value) || 0);
            }
        });
        data.push(rowData);
    });
    return data;
}

function getTimeLabels() {
    const labels = Array.from(document.querySelectorAll('#excelBody tr td:first-child input'))
        .map(input => parseFloat(input.value) || 0);
    return labels;
}

function createChart(timeLabels, data, columnNames, xAxisName, yAxisName) {
    const ctx = document.getElementById('myChart').getContext('2d', { willReadFrequently: true });
    const datasets = columnNames.map((name, i) => ({
        label: name,
        data: [],
        borderColor: colors[i % colors.length],
        tension: 0.4,
        fill: false,
    }));

    const allYValues = data.flat();
    const yMin = Math.min(...allYValues, 0);
    const yMaxInitial = Math.max(...allYValues);

    currentChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            animation: { duration: 0 },
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { 
                    type: 'linear', 
                    position: 'bottom', 
                    min: Math.min(...timeLabels),
                    max: Math.max(...timeLabels),
                    title: { display: true, text: xAxisName },
                    ticks: {
                        callback: function(value) {
                            if (timeLabels.includes(value)) return value;
                            return null;
                        },
                        autoSkip: false
                    }
                },
                y: { 
                    beginAtZero: true, 
                    min: yMin,
                    max: yMaxInitial,
                    title: { display: true, text: yAxisName }
                }
            },
            showDetails: false,
            plugins: [{
                id: 'customNames',
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    if (chart.options.showDetails) {
                        console.log('Drawing names, showDetails:', chart.options.showDetails);
                        ctx.save();
                        chart.data.datasets.forEach((dataset, i) => {
                            if (dataset.data.length > 0) {
                                const meta = chart.getDatasetMeta(i);
                                if (meta.data && meta.data.length > 0) {
                                    meta.data.forEach((point, index) => {
                                        const name = dataset.label;
                                        const x = point.x;
                                        const y = point.y - 10;
                                        ctx.fillStyle = dataset.borderColor;
                                        ctx.font = '12px Arial';
                                        ctx.textAlign = 'center';
                                        console.log(`Drawing ${name} at (${x}, ${y})`);
                                        ctx.fillText(name, x, y);
                                    });
                                } else {
                                    console.warn(`No meta data for dataset ${dataset.label}`);
                                }
                            }
                        });
                        ctx.restore();
                    }
                }
            }]
        }
    });
    return datasets; // Return datasets for animation
}

function updateChart() {
    const data = getTableData();
    const timeLabels = getTimeLabels();
    const columnNames = Array.from(document.querySelectorAll('#excelHeader th input')).slice(1).map(input => input.value);
    const animationSpeed = parseFloat(document.getElementById('animationSpeed').value) * 1000 || 1000;
    const xAxisName = document.getElementById('xAxisName').value || 'X-Axis';
    const yAxisName = document.getElementById('yAxisName').value || 'Y-Axis';

    if (!data.length || !timeLabels.length) {
        console.error('No data or time labels available');
        return;
    }

    if (currentChart) {
        currentChart.destroy();
    }
    const datasets = createChart(timeLabels, data, columnNames, xAxisName, yAxisName);

    let step = 0;
    const totalSteps = data.length - 1;

    function animateLine(timestamp) {
        if (!animateLine.startTime) animateLine.startTime = timestamp;
        const elapsed = timestamp - animateLine.startTime;
        const totalAnimationTime = animationSpeed;
        const timePerStep = totalAnimationTime / totalSteps;
        const progress = elapsed / timePerStep;
        const currentStep = Math.floor(progress);
        const stepProgress = progress - currentStep;

        if (currentStep < totalSteps) {
            datasets.forEach((dataset, i) => {
                const fromX = timeLabels[currentStep];
                const fromY = data[currentStep][i];
                const toX = timeLabels[currentStep + 1];
                const toY = data[currentStep + 1][i];

                const interpolatedX = fromX + (toX - fromX) * stepProgress;
                const interpolatedY = fromY + (toY - fromY) * stepProgress;

                while (dataset.data.length <= currentStep) {
                    dataset.data.push({ x: timeLabels[dataset.data.length], y: data[dataset.data.length][i] });
                }
                dataset.data[currentStep + 1] = { x: interpolatedX, y: interpolatedY };
            });

            const currentYMax = Math.max(...datasets.flatMap(d => d.data.map(p => p.y)));
            const targetYMax = Math.max(currentYMax, currentChart.options.scales.y.max);
            if (targetYMax !== currentChart.options.scales.y.max) {
                const previousYMax = currentChart.options.scales.y.max;
                const yDiff = targetYMax - previousYMax;
                const yStep = yDiff * stepProgress * 0.1;
                currentChart.options.scales.y.max = previousYMax + yStep;
            }

            currentChart.update('none');
            requestAnimationFrame(animateLine);
        } else {
            datasets.forEach((dataset, i) => {
                while (dataset.data.length < data.length) {
                    dataset.data.push({ x: timeLabels[dataset.data.length], y: data[dataset.data.length][i] });
                }
            });
            const finalYMax = Math.max(...datasets.flatMap(d => d.data.map(p => p.y)));
            currentChart.options.scales.y.max = finalYMax;
            currentChart.update('none');
        }
    }

    if (totalSteps >= 0) {
        datasets.forEach((dataset, i) => {
            dataset.data.push({ x: timeLabels[0], y: data[0][i] });
        });
        currentChart.update('none');
        if (totalSteps > 0) {
            animateLine.startTime = null;
            requestAnimationFrame(animateLine);
        }
    }
}

function exportCSV() {
  const headers = Array.from(document.querySelectorAll('#excelHeader th input')).map(input => input.value);
  const csvContent = [headers.join(',')];
  getTableData().forEach((row, i) => {
    csvContent.push([document.querySelectorAll('#excelBody tr')[i].querySelector('input').value, ...row].join(','));
  });

  const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'csv') {
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const data = Papa.parse(text, { header: false }).data;
      updateTableFromData(data);
    };
    reader.readAsText(file);
  } else if (extension === 'xlsx') {
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const dataArray = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      updateTableFromData(dataArray);
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert('Unsupported file type. Please upload a CSV or XLSX file.');
  }
}

function updateTableFromData(data) {
  if (data.length < 1) return;

  const headers = data[0];
  const dataRows = data.slice(1);

  columns = headers.length - 1;
  rows = dataRows.length;

  updateTableStructure();

  const headerInputs = document.querySelectorAll('#excelHeader th input');
  for (let i = 0; i < headers.length; i++) {
    headerInputs[i].value = headers[i];
  }

  const bodyRows = document.querySelectorAll('#excelBody tr');
  dataRows.forEach((row, rowIndex) => {
    const inputs = bodyRows[rowIndex].querySelectorAll('input');
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      inputs[colIndex].value = row[colIndex];
    }
  });

  updateChart();
}

initializeTable();
