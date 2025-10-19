// Tiles module: load, render, CRUD

async function loadTiles() {
    try {
        const response = await fetch('/api/tiles');
        tiles = await response.json();
        renderTilesTable();
    } catch (error) {
        showAlert('Error loading tiles: ' + error.message, 'danger');
    }
}

function renderTilesTable() {
    const tbody = document.getElementById('tilesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    tiles.forEach(tile => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tile.id}</td>
            <td>${tile.name}</td>
            <td><span class="badge bg-primary">${tile.type}</span></td>
            <td>${tile.size}</td>
            <td>${tile.color}</td>
            <td>₹${tile.price}</td>
            <td>
                <span class="badge ${tile.quantity > 50 ? 'bg-success' : tile.quantity > 20 ? 'bg-warning' : 'bg-danger'}">
                    ${tile.quantity}
                </span>
            </td>
            <td>${tile.supplier || '-'}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="editTile(${tile.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTile(${tile.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddTileModal() {
    editingTileId = null;
    document.getElementById('tileModalTitle').textContent = 'Add New Tile';
    document.getElementById('tileForm').reset();
    document.getElementById('tileId').value = '';

    const modal = new bootstrap.Modal(document.getElementById('tileModal'));
    modal.show();
}

function editTile(id) {
    const tile = tiles.find(t => t.id === id);
    if (!tile) return;

    editingTileId = id;
    document.getElementById('tileModalTitle').textContent = 'Edit Tile';
    document.getElementById('tileId').value = tile.id;
    document.getElementById('tileName').value = tile.name;
    document.getElementById('tileType').value = tile.type;
    document.getElementById('tileSize').value = tile.size;
    document.getElementById('tileColor').value = tile.color;
    document.getElementById('tilePrice').value = tile.price;
    document.getElementById('tileQuantity').value = tile.quantity;
    document.getElementById('tileSupplier').value = tile.supplier || '';
    document.getElementById('tileDescription').value = tile.description || '';

    const modal = new bootstrap.Modal(document.getElementById('tileModal'));
    modal.show();
}

async function saveTile() {
    const form = document.getElementById('tileForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const tileData = {
        name: document.getElementById('tileName').value,
        type: document.getElementById('tileType').value,
        size: document.getElementById('tileSize').value,
        color: document.getElementById('tileColor').value,
        price: parseFloat(document.getElementById('tilePrice').value),
        quantity: parseInt(document.getElementById('tileQuantity').value),
        supplier: document.getElementById('tileSupplier').value,
        description: document.getElementById('tileDescription').value
    };

    try {
        const url = editingTileId ? `/api/tiles/${editingTileId}` : '/api/tiles';
        const method = editingTileId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tileData)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('tileModal'));
            modal.hide();
            showAlert(editingTileId ? 'Tile updated successfully!' : 'Tile added successfully!', 'success');
            loadTiles();
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

async function deleteTile(id) {
    if (!confirm('Are you sure you want to delete this tile?')) return;

    try {
        const response = await fetch(`/api/tiles/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Tile deleted successfully!', 'success');
            loadTiles();
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}


