// Initialize
let receipts = JSON.parse(localStorage.getItem('receipts')) || [];
let uploadedImage = null;

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Update total count
updateTotalCount();

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-purple-600', 'border-b-2', 'border-purple-600');
        btn.classList.add('text-gray-500');
    });

    // Show selected tab
    document.getElementById('content-' + tabName).classList.remove('hidden');
    document.getElementById('tab-' + tabName).classList.add('text-purple-600', 'border-b-2', 'border-purple-600');
    document.getElementById('tab-' + tabName).classList.remove('text-gray-500');

    // Load data for specific tabs
    if (tabName === 'list') {
        displayReceipts();
    } else if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Preview uploaded image
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            document.getElementById('imagePreview').innerHTML = `
                <img src="${e.target.result}" class="max-w-full h-48 mx-auto rounded-lg object-cover">
            `;
        }
        reader.readAsDataURL(file);
    }
}

// Quick Scan (Mock OCR)
function quickScan() {
    if (!uploadedImage) {
        showToast('Please upload an image first!', 'error');
        return;
    }

    // Simulate OCR processing
    showToast('Scanning receipt... 🔍', 'info');
    
    setTimeout(() => {
        // Mock data extraction
        const mockStores = ['Amazon', 'Walmart', 'Target', 'Starbucks', 'McDonald\'s'];
        const mockAmounts = [25.99, 49.99, 15.50, 89.99, 199.99];
        
        document.getElementById('storeName').value = mockStores[Math.floor(Math.random() * mockStores.length)];
        document.getElementById('amount').value = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];
        
        showToast('Receipt scanned successfully! ✅', 'success');
    }, 1500);
}

// Add Receipt
function addReceipt(event) {
    event.preventDefault();

    const receipt = {
        id: Date.now(),
        storeName: document.getElementById('storeName').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value,
        image: uploadedImage,
        timestamp: new Date().toISOString()
    };

    receipts.push(receipt);
    localStorage.setItem('receipts', JSON.stringify(receipts));

    // Reset form
    event.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    uploadedImage = null;
    document.getElementById('imagePreview').innerHTML = `
        <svg class="w-16 h-16 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
    `;

    updateTotalCount();
    showToast('Receipt added successfully! 🎉', 'success');
}

// Display Receipts
function displayReceipts(filteredReceipts = receipts) {
    const container = document.getElementById('receiptsList');
    
    if (filteredReceipts.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-8">No receipts found. 📝</p>';
        return;
    }

    container.innerHTML = filteredReceipts.map(receipt => `
        <div class="receipt-card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    ${receipt.image ? `<img src="${receipt.image}" class="w-20 h-20 object-cover rounded-lg mb-3">` : ''}
                    <h3 class="font-bold text-lg text-gray-800">${receipt.storeName}</h3>
                    <p class="text-2xl font-bold text-purple-600 mt-1">₹${receipt.amount.toFixed(2)}</p>
                    <div class="mt-2 space-y-1">
                        <p class="text-sm text-gray-600"><span class="font-semibold">Category:</span> ${getCategoryIcon(receipt.category)} ${receipt.category}</p>
                        <p class="text-sm text-gray-600"><span class="font-semibold">Date:</span> ${formatDate(receipt.date)}</p>
                        ${receipt.notes ? `<p class="text-sm text-gray-600"><span class="font-semibold">Notes:</span> ${receipt.notes}</p>` : ''}
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="downloadReceiptPDF(${receipt.id})" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                        📥 PDF
                    </button>
                    <button onclick="deleteReceipt(${receipt.id})" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Receipts
function filterReceipts() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortBy').value;

    let filtered = receipts.filter(receipt => {
        const matchesSearch = receipt.storeName.toLowerCase().includes(searchTerm) || 
                            receipt.notes.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || receipt.category === category;
        return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
    });

    displayReceipts(filtered);
}

// Delete Receipt
function deleteReceipt(id) {
    if (confirm('Are you sure you want to delete this receipt?')) {
        receipts = receipts.filter(r => r.id !== id);
        localStorage.setItem('receipts', JSON.stringify(receipts));
        displayReceipts();
        updateTotalCount();
        showToast('Receipt deleted! 🗑️', 'success');
    }
}

// Update Analytics
function updateAnalytics() {
    const total = receipts.reduce((sum, r) => sum + r.amount, 0);
    const currentMonth = new Date().getMonth();
    const monthTotal = receipts.filter(r => new Date(r.date).getMonth() === currentMonth)
                                   .reduce((sum, r) => sum + r.amount, 0);
    const avg = receipts.length > 0 ? total / receipts.length : 0;

    document.getElementById('totalSpent').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('monthSpent').textContent = `₹${monthTotal.toFixed(2)}`;
    document.getElementById('avgSpent').textContent = `₹${avg.toFixed(2)}`;

    updateCharts();
}

// Update Charts
let categoryChart, trendChart;

function updateCharts() {
    // Category Chart
    const categoryData = {};
    receipts.forEach(r => {
        categoryData[r.category] = (categoryData[r.category] || 0) + r.amount;
    });

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Trend Chart (Last 6 months)
    const monthlyData = {};
    receipts.forEach(r => {
        const month = new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + r.amount;
    });

    const trendCtx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Spending',
                data: Object.values(monthlyData),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Export PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('SmartReceipt - Expense Report', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    receipts.forEach((receipt, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(`${index + 1}. ${receipt.storeName}`, 20, y);
        doc.text(`Amount: ₹${receipt.amount.toFixed(2)}`, 30, y + 7);
        doc.text(`Category: ${receipt.category}`, 30, y + 14);
        doc.text(`Date: ${formatDate(receipt.date)}`, 30, y + 21);
        
        y += 30;
    });
    
    doc.save('receipts.pdf');
    showToast('PDF downloaded! 📄', 'success');
}

// Download single receipt PDF
function downloadReceiptPDF(id) {
    const receipt = receipts.find(r => r.id === id);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('RECEIPT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Store: ${receipt.storeName}`, 20, 40);
    doc.text(`Amount: ₹${receipt.amount.toFixed(2)}`, 20, 50);
    doc.text(`Category: ${receipt.category}`, 20, 60);
    doc.text(`Date: ${formatDate(receipt.date)}`, 20, 70);
    if (receipt.notes) doc.text(`Notes: ${receipt.notes}`, 20, 80);
    
    doc.save(`receipt-${receipt.id}.pdf`);
    showToast('Receipt PDF downloaded! 📄', 'success');
}

// Export CSV
function exportCSV() {
    const headers = ['Store Name', 'Amount', 'Category', 'Date', 'Notes'];
    const rows = receipts.map(r => [r.storeName, r.amount, r.category, r.date, r.notes]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipts.csv';
    a.click();
    
    showToast('CSV downloaded! 📊', 'success');
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to delete ALL receipts? This cannot be undone!')) {
        receipts = [];
        localStorage.setItem('receipts', JSON.stringify(receipts));
        displayReceipts();
        updateTotalCount();
        showToast('All data cleared! 🗑️', 'success');
    }
}

// Helper Functions
function updateTotalCount() {
    document.getElementById('totalCount').textContent = receipts.length;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Shopping': '🛍️',
        'Transport': '🚗',
        'Bills': '💡',
        'Healthcare': '🏥',
        'Entertainment': '🎬',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden', 'bg-green-600', 'bg-red-600', 'bg-blue-600');
    
    if (type === 'error') toast.classList.add('bg-red-600');
    else if (type === 'info') toast.classList.add('bg-blue-600');
    else toast.classList.add('bg-green-600');
    
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
