// Global shared state and utilities
let tiles = [];
let bills = [];
let editingTileId = null;

// Show different sections (Tiles/Bills)
function showSection(section) {
    document.getElementById('tiles-section').style.display = section === 'tiles' ? 'block' : 'none';
    document.getElementById('bills-section').style.display = section === 'bills' ? 'block' : 'none';

    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
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


