// Global variables
let tiles = [];
let bills = [];
let editingTileId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadTiles();
    loadBills();
});

// Show different sections
function showSection(section) {
    document.getElementById('tiles-section').style.display = section === 'tiles' ? 'block' : 'none';
    document.getElementById('bills-section').style.display = section === 'bills' ? 'block' : 'none';
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
}

// Load tiles from API
async function loadTiles() {
    try {
        const response = await fetch('/api/tiles');
        tiles = await response.json();
        renderTilesTable();
    } catch (error) {
        showAlert('Error loading tiles: ' + error.message, 'danger');
    }
}

// Render tiles table
function renderTilesTable() {
    const tbody = document.getElementById('tilesTableBody');
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

// Show add tile modal
function showAddTileModal() {
    editingTileId = null;
    document.getElementById('tileModalTitle').textContent = 'Add New Tile';
    document.getElementById('tileForm').reset();
    document.getElementById('tileId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('tileModal'));
    modal.show();
}

// Edit tile
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

// Save tile (add or update)
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

// Delete tile
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

// Load bills from API
async function loadBills() {
    try {
        const response = await fetch('/api/bills');
        bills = await response.json();
        renderBillsTable();
    } catch (error) {
        showAlert('Error loading bills: ' + error.message, 'danger');
    }
}

// Render bills table
function renderBillsTable() {
    const tbody = document.getElementById('billsTableBody');
    tbody.innerHTML = '';
    
    bills.forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.bill_number}</td>
            <td>${bill.customer_name}</td>
            <td>${bill.customer_phone || '-'}</td>
            <td>₹${bill.final_amount}</td>
            <td>${new Date(bill.bill_date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewBill(${bill.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show create bill modal
function showCreateBillModal() {
    document.getElementById('billForm').reset();
    document.getElementById('discount').value = 0;
    document.getElementById('taxAmount').value = 0;
    document.getElementById('finalAmount').value = 0;
    
    // Reset bill items
    const billItems = document.getElementById('billItems');
    billItems.innerHTML = '';
    addBillItem();
    
    // Load tiles for selection
    loadTilesForBill();
    
    const modal = new bootstrap.Modal(document.getElementById('billModal'));
    modal.show();
}

// Load tiles for bill creation
function loadTilesForBill() {
    const selects = document.querySelectorAll('.tile-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Tile</option>';
        tiles.forEach(tile => {
            const option = document.createElement('option');
            option.value = tile.id;
            option.textContent = `${tile.name} - ${tile.type} (${tile.size}) - ₹${tile.price} - Qty: ${tile.quantity}`;
            option.dataset.price = tile.price;
            select.appendChild(option);
        });
    });
}

// Add bill item
function addBillItem() {
    const billItems = document.getElementById('billItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'row bill-item';
    itemDiv.innerHTML = `
        <div class="col-md-4">
            <div class="mb-3">
                <label class="form-label">Tile</label>
                <select class="form-control tile-select" required>
                    <option value="">Select Tile</option>
                </select>
            </div>
        </div>
        <div class="col-md-2">
            <div class="mb-3">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control quantity-input" min="1" required>
            </div>
        </div>
        <div class="col-md-2">
            <div class="mb-3">
                <label class="form-label">Price</label>
                <input type="number" class="form-control price-input" step="0.01" readonly>
            </div>
        </div>
        <div class="col-md-2">
            <div class="mb-3">
                <label class="form-label">Total</label>
                <input type="number" class="form-control total-input" step="0.01" readonly>
            </div>
        </div>
        <div class="col-md-2">
            <div class="mb-3">
                <label class="form-label">&nbsp;</label>
                <button type="button" class="btn btn-danger btn-sm d-block" onclick="removeBillItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    billItems.appendChild(itemDiv);
    
    // Load tiles for the new select
    const select = itemDiv.querySelector('.tile-select');
    tiles.forEach(tile => {
        const option = document.createElement('option');
        option.value = tile.id;
        option.textContent = `${tile.name} - ${tile.type} (${tile.size}) - ₹${tile.price} - Qty: ${tile.quantity}`;
        option.dataset.price = tile.price;
        select.appendChild(option);
    });
    
    // Add event listeners
    select.addEventListener('change', function() {
        const priceInput = this.closest('.bill-item').querySelector('.price-input');
        const quantityInput = this.closest('.bill-item').querySelector('.quantity-input');
        const totalInput = this.closest('.bill-item').querySelector('.total-input');
        
        if (this.value) {
            priceInput.value = this.selectedOptions[0].dataset.price;
            calculateItemTotal(this.closest('.bill-item'));
        } else {
            priceInput.value = '';
            totalInput.value = '';
        }
    });
    
    const quantityInput = itemDiv.querySelector('.quantity-input');
    quantityInput.addEventListener('input', function() {
        calculateItemTotal(this.closest('.bill-item'));
    });
}

// Remove bill item
function removeBillItem(button) {
    const billItems = document.getElementById('billItems');
    if (billItems.children.length > 1) {
        button.closest('.bill-item').remove();
        calculateBillTotal();
    }
}

// Calculate item total
function calculateItemTotal(itemRow) {
    const price = parseFloat(itemRow.querySelector('.price-input').value) || 0;
    const quantity = parseInt(itemRow.querySelector('.quantity-input').value) || 0;
    const total = price * quantity;
    itemRow.querySelector('.total-input').value = total.toFixed(2);
    calculateBillTotal();
}

// Calculate bill total
function calculateBillTotal() {
    let subtotal = 0;
    document.querySelectorAll('.total-input').forEach(input => {
        subtotal += parseFloat(input.value) || 0;
    });
    
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const tax = parseFloat(document.getElementById('taxAmount').value) || 0;
    const finalAmount = subtotal - discount + tax;
    
    document.getElementById('finalAmount').value = finalAmount.toFixed(2);
}

// Add event listeners for discount and tax
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('discount').addEventListener('input', calculateBillTotal);
    document.getElementById('taxAmount').addEventListener('input', calculateBillTotal);
});

// Create bill
async function createBill() {
    const form = document.getElementById('billForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect bill items
    const items = [];
    let isValid = true;
    
    document.querySelectorAll('.bill-item').forEach(itemRow => {
        const tileSelect = itemRow.querySelector('.tile-select');
        const quantityInput = itemRow.querySelector('.quantity-input');
        const priceInput = itemRow.querySelector('.price-input');
        
        if (tileSelect.value && quantityInput.value) {
            const tile = tiles.find(t => t.id == tileSelect.value);
            if (parseInt(quantityInput.value) > tile.quantity) {
                showAlert(`Insufficient quantity for ${tile.name}. Available: ${tile.quantity}`, 'danger');
                isValid = false;
                return;
            }
            
            items.push({
                tile_id: parseInt(tileSelect.value),
                quantity: parseInt(quantityInput.value),
                price: parseFloat(priceInput.value)
            });
        }
    });
    
    if (!isValid || items.length === 0) {
        showAlert('Please add at least one valid item', 'danger');
        return;
    }
    
    const billData = {
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        customer_address: document.getElementById('customerAddress').value,
        items: items,
        discount: parseFloat(document.getElementById('discount').value) || 0,
        tax_amount: parseFloat(document.getElementById('taxAmount').value) || 0,
        payment_method: document.getElementById('paymentMethod').value,
        notes: document.getElementById('notes').value
    };
    
    try {
        const response = await fetch('/api/bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(billData)
        });
        
        if (response.ok) {
            const result = await response.json();
            const modal = bootstrap.Modal.getInstance(document.getElementById('billModal'));
            modal.hide();
            showAlert(`Bill created successfully! Bill Number: ${result.bill_number}`, 'success');
            loadBills();
            loadTiles(); // Refresh tiles to show updated quantities
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// View bill details
function viewBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    
    let itemsHtml = '';
    const items = JSON.parse(bill.items);
    items.forEach(item => {
        const tile = tiles.find(t => t.id === item.tile_id);
        itemsHtml += `
            <tr>
                <td>${tile ? tile.name : 'Unknown'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `;
    });
    
    const modalHtml = `
        <div class="modal fade" id="viewBillModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Bill Details - ${bill.bill_number}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>Customer:</strong> ${bill.customer_name}<br>
                                <strong>Phone:</strong> ${bill.customer_phone || '-'}<br>
                                <strong>Address:</strong> ${bill.customer_address || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>Bill Date:</strong> ${new Date(bill.bill_date).toLocaleDateString()}<br>
                                <strong>Payment Method:</strong> ${bill.payment_method}
                            </div>
                        </div>
                        
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div class="row">
                            <div class="col-md-8"></div>
                            <div class="col-md-4">
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Subtotal:</strong></td>
                                        <td>₹${bill.total_amount}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Discount:</strong></td>
                                        <td>₹${bill.discount}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tax:</strong></td>
                                        <td>₹${bill.tax_amount}</td>
                                    </tr>
                                    <tr class="table-success">
                                        <td><strong>Final Amount:</strong></td>
                                        <td><strong>₹${bill.final_amount}</strong></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                        ${bill.notes ? `<div class="mt-3"><strong>Notes:</strong> ${bill.notes}</div>` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="printBill(${bill.id})">Print</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('viewBillModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewBillModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('viewBillModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Print bill
function printBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    
    const printWindow = window.open('', '_blank');
    const items = JSON.parse(bill.items);
    
    let itemsHtml = '';
    items.forEach(item => {
        const tile = tiles.find(t => t.id === item.tile_id);
        itemsHtml += `
            <tr>
                <td>${tile ? tile.name : 'Unknown'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill - ${bill.bill_number}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .bill-info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total-section { text-align: right; }
                .footer { margin-top: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Durga Traders</h1>
                <h2>Bill - ${bill.bill_number}</h2>
            </div>
            
            <div class="bill-info">
                <strong>Customer:</strong> ${bill.customer_name}<br>
                <strong>Phone:</strong> ${bill.customer_phone || '-'}<br>
                <strong>Address:</strong> ${bill.customer_address || '-'}<br>
                <strong>Date:</strong> ${new Date(bill.bill_date).toLocaleDateString()}<br>
                <strong>Payment Method:</strong> ${bill.payment_method}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="total-section">
                <p><strong>Subtotal: ₹${bill.total_amount}</strong></p>
                <p><strong>Discount: ₹${bill.discount}</strong></p>
                <p><strong>Tax: ₹${bill.tax_amount}</strong></p>
                <p><strong>Final Amount: ₹${bill.final_amount}</strong></p>
            </div>
            
            ${bill.notes ? `<div class="notes"><strong>Notes:</strong> ${bill.notes}</div>` : ''}
            
            <div class="footer">
                <p>Thank you for your business!</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Show alert message
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}
