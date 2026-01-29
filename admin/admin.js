// Existing code from original admin.js
console.log('admin.js loaded');

function getToken() {
  return localStorage.getItem('greenNetsToken');
}

const API_BASE_URL =
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1")
    ? "http://localhost:5001"
    : "https://YOUR_BACKEND_URL";
 // change later
 const API = API_BASE_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`
  };
}

const SIZE_OPTIONS = {
  "Green Nets": ["5.5ft", "7ft", "11ft", "15ft", "20ft"],
  "Tarpaulins": ["12ft", "18ft", "24ft", "30ft", "36ft"],
  "Tirpal": [
    "9ft*12ft",
    "15ft*12ft",
    "18ft*12ft",
    "24ft*18ft",
    "30ft*30ft",
    "30ft*36ft",
    "36ft*36ft",
    "40ft*24ft",
    "50ft*51ft"
  ]
};



function getUserRoleFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user.role;
  } catch {
    return null;
  }
}

// Protect dashboard
if (window.location.pathname.includes('dashboard.html')) {
  const role = getUserRoleFromToken();
  if (role !== 'admin') {
    alert('Access denied');
    window.location.href = '../index.html';
  } else {
    // Set admin name from localStorage
    const adminName = localStorage.getItem('greenNetsUserName') || 'Admin';
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminAvatar').textContent = adminName.charAt(0).toUpperCase();
    loadAnalytics();
  }
}




// Admin login (unchanged)
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || 'Login failed');
    return;
  }

  if (!data.user || data.user.role !== 'admin') {
    alert('You are not an admin');
    return;
  }

  localStorage.setItem('greenNetsToken', data.token);
  localStorage.setItem('greenNetsUserName', data.user.name);

  window.location.href = './dashboard.html';
});

// UI Helper Functions
function setActiveNav(menu) {
  document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
  if (menu === 'orders') document.querySelectorAll('.nav-links li')[1].classList.add('active');
  else if (menu === 'products') document.querySelectorAll('.nav-links li')[2].classList.add('active');
  else document.querySelectorAll('.nav-links li')[0].classList.add('active');
}

function showLoading() {
  document.getElementById('adminContent').innerHTML = `
    <div class="loading">
      <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 15px;"></i>
      <p>Loading...</p>
    </div>
  `;
}

function showError(message) {
  document.getElementById('adminContent').innerHTML = `
    <div style="text-align: center; padding: 40px; color: #ff4757;">
      <i class="fas fa-exclamation-triangle" style="font-size: 48px;"></i>
      <h3>Error</h3>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="showDashboard()">Go Back</button>
    </div>
  `;
}

const categorySubMap = {
  "Green Nets": ["100%", "90%", "75%", "50%"],
  "Tarpaulins": ["Premium", "Standard", "Economy"],
  "Tirpal": ["250gsm", "200gsm", "160gsm"]
};
const categoryQualityMap = {
  "Green Nets": ["100%", "90%", "75%", "50%"],
  "Tarpaulins": ["Premium", "Standard", "Economy"],
  "Tirpal": ["250gsm", "200gsm", "160gsm"]
};


const categorySelect = document.getElementById("pCategory");
const subCategorySelect = document.getElementById("pSubCategory");

function updateSubCategoryOptions() {
  const categorySelect = document.getElementById("pCategory");
  const subCategorySelect = document.getElementById("pSubCategory");

  if (!categorySelect || !subCategorySelect) return;

  const category = categorySelect.value;
  const subs = categorySubMap[category] || [];

  subCategorySelect.innerHTML =
    `<option value="">Select</option>` +
    subs.map(s => `<option value="${s}">${s}</option>`).join("");
}
function updateQualityOptions() {
  const categorySelect = document.getElementById("pCategory");
  const qualitySelect = document.getElementById("pQuality");

  if (!categorySelect || !qualitySelect) return;

  const category = categorySelect.value;
  const qualities = categoryQualityMap[category] || [];

  qualitySelect.innerHTML =
    `<option value="">Select</option>` +
    qualities.map(q => `<option value="${q}">${q}</option>`).join("");
}

categorySelect?.addEventListener("change", () => {
  updateSubCategoryOptions();
  updateQualityOptions();
});



// Dashboard view
function showDashboard() {
  setActiveNav('dashboard');
  const adminName = localStorage.getItem('greenNetsUserName') || 'Admin';
  document.getElementById('adminContent').innerHTML = `
    <h2>Welcome back, ${adminName}!</h2>
    <p style="color: #777; margin-top: 10px;">Manage your store efficiently.</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px;">
      <div style="background: #e3f2fd; padding: 20px; border-radius: 10px;">
        <i class="fas fa-shopping-bag" style="font-size: 30px; color: #2196f3;"></i>
        <h3 style="margin: 15px 0 5px;">Orders</h3>
        <p>Manage customer orders</p>
        <button class="btn btn-primary" style="margin-top: 10px;" onclick="loadOrders()">View Orders</button>
      </div>
      <div style="background: #e8f5e9; padding: 20px; border-radius: 10px;">
        <i class="fas fa-box" style="font-size: 30px; color: #4caf50;"></i>
        <h3 style="margin: 15px 0 5px;">Products</h3>
        <p>Manage product catalog</p>
        <button class="btn btn-primary" style="margin-top: 10px;" onclick="loadProducts()">View Products</button>
      </div>
    </div>
  `;
}

function updateSizeOptions(category, selectedSize = "") {
  const sizeSelect = document.getElementById("pSize");
  if (!sizeSelect) return;

  sizeSelect.innerHTML = `<option value="">Select</option>`;

  const options = SIZE_OPTIONS[category] || [];
  options.forEach(size => {
    sizeSelect.innerHTML += `
      <option value="${size}" ${size === selectedSize ? "selected" : ""}>
        ${size}
      </option>
    `;
  });
}


// Load Products with new UI


async function loadProducts() {
  setActiveNav("products");
  showLoading();

  try {
    const res = await fetch(`${API}/api/admin/products`, {
      headers: authHeaders()
    });

    const products = await res.json();
    if (!res.ok) throw new Error(products.message || "Failed to fetch products");

    allProductsCache = products;

    const container = document.getElementById("adminContent");

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2>Products</h2>
        <button class="btn primary" id="openAddProductModalBtn">+ Add Product</button>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin:15px 0;">
        <input
          type="text"
          id="productSearchInput"
          placeholder="Search product name..."
          style="padding:8px; border:1px solid #ddd; border-radius:8px; width:220px;"
        />

        <select id="productCategoryFilter" class="status-select" style="width:180px;">
          <option value="">All Categories</option>
          <option value="Green Nets">Green Nets</option>
          <option value="Tarpaulins">Tarpaulins</option>
          <option value="Tirpal">Tirpal</option>
        </select>

        <select id="productQualityFilter" class="status-select" style="width:180px;">
          <option value="">All Quality</option>
          <option value="100">100%</option>
          <option value="90">90%</option>
          <option value="75">75%</option>
          <option value="50">50%</option>
          <option value="premium">Premium</option>
          <option value="standard">Standard</option>
          <option value="economy">Economy</option>
          <option value="250gsm">250gsm</option>
          <option value="200gsm">200gsm</option>
          <option value="160gsm">160gsm</option>
        </select>

        <select id="productSizeFilter" class="status-select" style="width:180px;">
          <option value="">All Sizes</option>
        </select>

        <select id="productSort" class="status-select" style="width:200px;">
          <option value="latest" selected>Sort: Latest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="stock_low">Stock: Low → High</option>
          <option value="stock_high">Stock: High → Low</option>
        </select>
      </div>

      <p id="productsCountText" style="color:#777; margin-bottom: 20px;">
        Total: ${products.length} products
      </p>

      <div id="productsTableContainer"></div>
    `;

    document.getElementById("openAddProductModalBtn")?.addEventListener("click", openAddModal);

    // ✅ fill sizes initially
    updateProductSizeOptions("");

    // ✅ listeners for filter
    document.getElementById("productSearchInput").addEventListener("input", applyProductFilters);

    document.getElementById("productCategoryFilter").addEventListener("change", (e) => {
      updateProductSizeOptions(e.target.value);
      applyProductFilters();
    });

    document.getElementById("productQualityFilter").addEventListener("change", applyProductFilters);
    document.getElementById("productSizeFilter").addEventListener("change", applyProductFilters);
    document.getElementById("productSort").addEventListener("change", applyProductFilters);

    document.getElementById("productCategoryFilter").addEventListener("change", (e) => {
    updateProductSizeOptions(e.target.value);
    updateProductQualityOptions(e.target.value);

  // reset selected quality when category changes
  document.getElementById("productQualityFilter").value = "";
      
  updateProductQualityOptions("");
  applyProductFilters();
});

    // ✅ initial render
    renderProductsTable(allProductsCache);

  } catch (err) {
    showError(err.message);
  }
}

function updateProductSizeOptions(category) {
  const sizeSelect = document.getElementById("productSizeFilter");
  if (!sizeSelect) return;

  sizeSelect.innerHTML = `<option value="">All Sizes</option>`;

  const sizes = SIZE_OPTIONS[category] || [];

  sizes.forEach(size => {
    sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
  });
}

function applyProductFilters() {
  const search = document.getElementById("productSearchInput").value.trim().toLowerCase();
  const category = document.getElementById("productCategoryFilter").value;
  const quality = document.getElementById("productQualityFilter").value;
  const size = document.getElementById("productSizeFilter").value;
  const sort = document.getElementById("productSort").value;

  let filtered = [...allProductsCache];

  // ✅ search by name
  if (search) {
    filtered = filtered.filter(p => (p.name || "").toLowerCase().includes(search));
  }

  // ✅ filter category
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // ✅ filter quality
if (quality) {
  filtered = filtered.filter(p => {
    const dbQuality = String(p.quality || "").toLowerCase().trim();
    const selectedQuality = String(quality || "").toLowerCase().trim();

    return dbQuality === selectedQuality;
  });
}
  // ✅ filter size
  if (size) {
    filtered = filtered.filter(p => String(p.size) === String(size));
  }

  // ✅ sorting
  filtered.sort((a, b) => {
    const da = new Date(a.createdAt || 0);
    const db = new Date(b.createdAt || 0);

    if (sort === "latest") return db - da;
    if (sort === "oldest") return da - db;
    if (sort === "stock_low") return (a.stock ?? 0) - (b.stock ?? 0);
    if (sort === "stock_high") return (b.stock ?? 0) - (a.stock ?? 0);

    return 0;
  });

  renderProductsTable(filtered);
}

function renderProductsTable(products) {
  document.getElementById("productsCountText").innerText =
    `Total: ${products.length} products`;

  const container = document.getElementById("productsTableContainer");

  if (!products || products.length === 0) {
    container.innerHTML = `<p style="color:#777;">No products found.</p>`;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quality</th>
            <th>Size</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.category || "-"}</td>
              <td>${p.quality || "-"}</td>
              <td>${p.size || "-"}</td>
              <td>${p.stock ?? 0}</td>
              <td>${p.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button class="btn secondary" onclick='openEditModal(${JSON.stringify(p)})'>Edit</button>
                <button class="btn secondary" onclick="hardDeleteProduct('${p._id}')">Delete</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function updateProductQualityOptions(category) {
  const qSelect = document.getElementById("productQualityFilter");
  if (!qSelect) return;

  qSelect.innerHTML = `<option value="">All Quality</option>`;

  let qualities = [];

  if (category === "Green Nets") {
    qualities = ["100%", "90%", "75%", "50%"];
  } else if (category === "Tarpaulins") {
    qualities = ["premium", "standard", "economy"];
  } else if (category === "Tirpal") {
    qualities = ["250gsm", "200gsm", "160gsm"];
  } else {
    // if category is All Categories
    qualities = ["100%", "90%", "75%", "50%", "premium", "standard", "economy", "250gsm", "200gsm", "160gsm"];
  }

  qualities.forEach(q => {
    qSelect.innerHTML += `<option value="${q}">${q}</option>`;
  });
}


const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const productForm = document.getElementById("productForm");

document.getElementById("pCategory")?.addEventListener("change", (e) => {
  updateSizeOptions(e.target.value);
});


function openModal() {
  if (!productModal) {
    alert("❌ productModal not found. Check #productModal in dashboard.html");
    return;
  }

  productModal.classList.remove("hidden");
}



function openAddModal() {
  openModal();

  // reset title
  document.getElementById("modalTitle").innerText = "Add Product";
  document.getElementById("productId").value = "";
    const category = document.getElementById("pCategory").value;
  updateSizeOptions(category);

  // Populate dropdowns
  updateSubCategoryOptions();
  updateQualityOptions();
}




function closeModal() {
  productModal.classList.add("hidden");
  productForm.reset();
  document.getElementById("productId").value = "";
  document.getElementById("modalTitle").innerText = "Add Product";
}

closeModalBtn?.addEventListener("click", closeModal);
cancelBtn?.addEventListener("click", closeModal);



function openEditModal(product) {
  openModal();
  document.getElementById("modalTitle").innerText = "Edit Product";
  document.getElementById("productId").value = product._id;
  document.getElementById("pName").value = product.name;
  document.getElementById("pPrice").value = product.price;
document.getElementById("pCategory").value = product.category;

updateSubCategoryOptions();
updateQualityOptions();
 updateSizeOptions(product.category, product.size);

document.getElementById("pSubCategory").value = product.subCategory || "";
document.getElementById("pQuality").value = product.quality || "";


  document.getElementById("pStock").value = product.stock ?? 0;
  document.getElementById("pDescription").value = product.description || "";
}
productForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
const id = document.getElementById("productId").value;

const formData = new FormData();

// get elements safely
const nameEl = document.getElementById("pName");
const priceEl = document.getElementById("pPrice");
const categoryEl = document.getElementById("pCategory");
const stockEl = document.getElementById("pStock");
const descEl = document.getElementById("pDescription");
const qualityEl = document.getElementById("pQuality");
const subCategoryEl = document.getElementById("pSubCategory");

formData.append("name", nameEl?.value || "");
formData.append("price", priceEl?.value || "");
formData.append("category", categoryEl?.value || "");
formData.append("stock", stockEl?.value || "0");
formData.append("description", descEl?.value || "");
formData.append("quality", qualityEl?.value || "");
formData.append("subCategory", subCategoryEl?.value || "");
formData.append("size", document.getElementById("pSize").value);

// ✅ optional: basic validation
if (!formData.get("name") || !formData.get("price") || !formData.get("category")) {
  alert("Please fill Product Name, Price, and Category");
  return;
}

const cat = formData.get("category");

const needsSubCategory = ["Green Nets", "Tarpaulins", "Tirpal"].includes(cat);

if (needsSubCategory && !formData.get("subCategory")) {
  alert("Please select Sub Category");
  return;
}

if (!formData.get("size")) {
  alert("Please select Size");
  return;
}




  const imageFile = document.getElementById("pImage").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const url = id
    ? `${API_BASE_URL}/api/admin/products/${id}`
    : `${API_BASE_URL}/api/admin/products`;

  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}` // NOTE: no Content-Type in FormData
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to save product");
    return;
  }

  alert("✅ Product saved successfully!");
  closeModal();
  loadProducts();
});
async function softDeleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to delete product");
    return;
  }

  alert("✅ Product deleted (inactive)");
  loadProducts();
}


// Load Orders with new UI
async function loadOrders() {
  setActiveNav('orders');
  showLoading();
  
  try {
    const res = await fetch(`${API}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    if (!res.ok) throw new Error('Failed to load orders');
    
    const orders = await res.json();
    allOrdersCache =orders;
    
    if (orders.length === 0) {
      document.getElementById('adminContent').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-bag"></i>
          <h3>No Orders Found</h3>
          <p>There are no orders yet.</p>
        </div>
      `;
      return;
    }
    
document.getElementById('adminContent').innerHTML = `
  <h2>Orders</h2>

  <div style="display:flex; gap:10px; flex-wrap:wrap; margin:15px 0;">
    <input type="text" id="orderSearchInput"
      placeholder="Search Order ID..."
      style="padding:8px; border:1px solid #ddd; border-radius:8px; width:220px;"
    />

    <select id="orderStatusFilter" class="status-select" style="width:180px;">
      <option value="">All Status</option>
      <option value="Pending">Pending</option>
      <option value="Confirmed">Confirmed</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>

    <select id="orderSort" class="status-select" style="width:180px;">
      <option value="latest" selected>Sort: Latest</option>
      <option value="oldest">Sort: Oldest</option>
    </select>

    <button class="btn btn-primary btn-small" onclick="applyOrderFilters()">Apply</button>
  </div>

  <p id="ordersCountText" style="color: #777; margin-bottom: 20px;">
    Total: ${orders.length} orders
  </p>

  <div id="ordersTableContainer"></div>
`;
  } catch (err) {
    showError(err.message);
  }
  document.getElementById("orderSearchInput").addEventListener("input", applyOrderFilters);
  document.getElementById("orderStatusFilter").addEventListener("change", applyOrderFilters);
  document.getElementById("orderSort").addEventListener("change", applyOrderFilters);
  renderOrdersTable(allOrdersCache);
}
let allOrdersCache = [];
let allProductsCache = [];

function applyOrderFilters() {
  const search = document.getElementById("orderSearchInput").value.trim().toLowerCase();
  const status = document.getElementById("orderStatusFilter").value;
  const sort = document.getElementById("orderSort").value;

  let filtered = [...allOrdersCache];

  // Search by Order ID
  if (search) {
    filtered = filtered.filter(o => o._id?.toLowerCase().includes(search));
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter(o => (o.status || "Pending") === status);
  }

  // Sort
  filtered.sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);

    return sort === "latest" ? db - da : da - db;
  });

  renderOrdersTable(filtered);
}

function renderOrdersTable(orders) {
  document.getElementById("ordersCountText").innerText =
    `Total: ${orders.length} orders`;

  document.getElementById("ordersTableContainer").innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total (₹)</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td><small>${order._id ? order._id.substring(0, 8) + '...' : 'N/A'}</small></td>
              <td>${order.user?.name || 'Guest'}</td>
              <td><strong>₹${order.totalAmount || 0}</strong></td>
              <td>
                <span class="status-badge status-${(order.status || 'pending').toLowerCase()}">
                  ${order.status || 'Pending'}
                </span>
              </td>
              <td><small>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</small></td>
              <td style="display:flex; gap:6px; flex-wrap:wrap;">
  
  <!-- NEW BUTTON -->
  <button class="btn secondary btn-small"
    onclick="openOrderItemsModal('${order._id}')">
    View Items
  </button>

  <!-- EXISTING STATUS DROPDOWN -->
  <select class="status-select" id="status-${order._id}">
    ${['Pending','Confirmed','Delivered','Cancelled']
      .map(s => `
        <option value="${s}" ${s === order.status ? 'selected' : ''}>
          ${s}
        </option>
      `).join("")}
  </select>

  <!-- EXISTING UPDATE BUTTON -->
  <button class="btn btn-primary btn-small"
    onclick="updateOrderStatus('${order._id}')">
    Update
  </button>

</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}


async function loadAnalytics() {
  setActiveNav("dashboard");
  showLoading();

  try {
    const [summaryRes, recentOrdersRes, lowStockRes] = await Promise.all([
      fetch(`${API}/api/admin/analytics/summary`, { headers: authHeaders() }),
      fetch(`${API}/api/admin/analytics/recent-orders`, { headers: authHeaders() }),
      fetch(`${API}/api/admin/analytics/low-stock?limit=8`, { headers: authHeaders() }),
    ]);

    const summary = await summaryRes.json();
    const recentOrders = await recentOrdersRes.json();
    const lowStock = await lowStockRes.json();

    if (!summaryRes.ok) throw new Error(summary.message || "Failed to load summary");
    if (!recentOrdersRes.ok) throw new Error(recentOrders.message || "Failed to load recent orders");
    if (!lowStockRes.ok) throw new Error(lowStock.message || "Failed to load low stock products");

    document.getElementById("adminContent").innerHTML = `
      <h2>Dashboard Analytics</h2>
      <p style="color:#777; margin-bottom:20px;">Store performance summary</p>

      <!-- KPI cards -->
      <div style="
        display:grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-top: 20px;
      ">
        <div class="stat-card">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h3 style="margin:0;">Total Revenue</h3>

    <select id="revenueTotalFilter" class="status-select" style="width:120px;">
      <option value="0">Today</option>
      <option value="7" selected>7 Days</option>
      <option value="30">30 Days</option>
      <option value="90">90 Days</option>
    </select>
  </div>

  <p id="totalRevenueText" style="font-size:24px; font-weight:bold; margin-top:10px;">
    ₹${summary.totalRevenue || 0}
  </p>
</div>

        <div class="stat-card">
          <h3>Total Orders</h3>
          <p style="font-size:24px; font-weight:bold;">${summary.totalOrders || 0}</p>
        </div>

        <div class="stat-card">
          <h3>Total Products</h3>
          <p style="font-size:24px; font-weight:bold;">${summary.totalProducts || 0}</p>
        </div>

        <div class="stat-card">
          <h3>Pending Orders</h3>
          <p style="font-size:24px; font-weight:bold;">${summary.pendingOrders || 0}</p>
        </div>
      </div>
     

      

      <!-- Recent Orders + Low Stock -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:30px;">
        <div class="stat-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;">Recent Orders</h3>
            <button class="btn secondary" onclick="loadOrders()">View All</button>
          </div>

          ${
            recentOrders.length === 0
              ? `<p style="margin-top:15px; color:#777;">No orders yet.</p>`
              : `
                <div style="overflow-x:auto; margin-top:15px;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recentOrders.map(o => `
                        <tr>
                          <td><small>${o._id?.substring(0, 8)}...</small></td>
                          <td>${o.user?.name || "Guest"}</td>
                          <td><strong>₹${o.totalAmount || 0}</strong></td>
                          <td>
                            <span class="status-badge status-${(o.status || "Pending").toLowerCase()}">
                              ${o.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              `
          }
        </div>

        <div class="stat-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;">Low Stock</h3>
            <button class="btn secondary" onclick="loadProducts()">Manage</button>
          </div>

          ${
            lowStock.length === 0
              ? `<p style="margin-top:15px; color:#777;">No low stock products 🎉</p>`
              : `
                <div style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">
                  ${lowStock.map(p => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #eee; border-radius:10px;">
                      <div>
                        <div style="font-weight:600;">${p.name}</div>
                        <small style="color:#777;">${p.category || ""}</small>
                      </div>
                      <div style="font-weight:700;">
                        ${p.stock ?? 0}
                      </div>
                    </div>
                  `).join("")}
                </div>
              `
          }
        </div>
      </div>
<!-- Charts -->
<div class="charts-grid">

  <div class="stat-card chart-box">
    <h3>Orders by Status</h3>
    <canvas id="orderStatusChart"></canvas>
  </div>

  <div class="stat-card chart-box">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0;">Revenue Trend</h3>

      <div style="display:flex; gap:10px;">
        <select id="revenueDaysSelect" class="status-select" style="width:140px;">
          <option value="7" selected>Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>

        <select id="revenueCategorySelect" class="status-select" style="width:150px;">
          <option value="" selected>All Categories</option>
          <option value="Green Nets">Green Nets</option>
          <option value="Tarpaulins">Tarpaulins</option>
          <option value="Tirpal">Tirpal</option>
        </select>
      </div>
    </div>

    <canvas id="revenueChart"></canvas>
  </div>

</div>
    `;
          document.getElementById("revenueDaysSelect").addEventListener("change", (e) => {
  renderRevenueChart(Number(e.target.value));
});
    // ✅ Charts will be drawn in Step 6
    renderOrderStatusChart(summary.orderStatusCounts || {});
    renderRevenueChart(7);
    document.getElementById("revenueDaysSelect").addEventListener("change", () => {
  const days = document.getElementById("revenueDaysSelect").value;
  const category = document.getElementById("revenueCategorySelect").value;
  renderRevenueChart(days, category);
});

document.getElementById("revenueCategorySelect").addEventListener("change", () => {
  const days = document.getElementById("revenueDaysSelect").value;
  const category = document.getElementById("revenueCategorySelect").value;
  renderRevenueChart(days, category);
});
const revenueFilter = document.getElementById("revenueTotalFilter");

if (revenueFilter) {
  revenueFilter.addEventListener("change", (e) => {
    updateRevenueTotal(e.target.value);
  });
}

  } catch (err) {
    showError(err.message);
  }
}
async function updateRevenueTotal(days) {
  try {
    const res = await fetch(`${API}/api/admin/analytics/revenue-total?days=${days}`, {
      headers: authHeaders(),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch revenue total");

    document.getElementById("totalRevenueText").innerText = `₹${data.totalRevenue || 0}`;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Update order status (unchanged logic, better UI)
async function updateOrderStatus(orderId) {
  const select = document.getElementById(`status-${orderId}`);
  const newStatus = select.value;
  
  if (!confirm(`Change order status to "${newStatus}"?`)) return;
  
  try {
    const res = await fetch(`${API}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!res.ok) throw new Error('Update failed');
    
    alert('Order status updated successfully!');
    loadOrders(); // refresh list
  } catch (err) {
    alert('Failed to update status');
  }
}


let orderStatusChartInstance = null;


function renderOrderStatusChart(orderStatusCounts) {
  const ctx = document.getElementById("orderStatusChart");
  if (!ctx) return;

  const labels = Object.keys(orderStatusCounts);
  const values = Object.values(orderStatusCounts);

  if (orderStatusChartInstance) orderStatusChartInstance.destroy();

  orderStatusChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Orders",
          data: values,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

//let revenueChartInstance = null;

let revenueChartInstance = null;

async function renderRevenueChart(days = 7, category = "") {
  try {
    let url = `${API}/api/admin/analytics/revenue-trend?days=${days}`;

    // ✅ add category only if selected
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to load revenue trend");

    const labels = data.map(d => d.date);
    const values = data.map(d => d.revenue);

    const ctx = document.getElementById("revenueChart").getContext("2d");

    // ✅ destroy previous chart to avoid overlapping
    if (revenueChartInstance) revenueChartInstance.destroy();

    revenueChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue (₹)",
            data: values,
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  } catch (err) {
    console.error("Revenue chart error:", err);
  }
}


// Logout (unchanged)
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('greenNetsToken');
    localStorage.removeItem('greenNetsUserName');
    window.location.href = 'admin-login.html';
  }
}
function openOrderItemsModal(orderId) {
  const order = allOrdersCache.find(o => o._id === orderId);
  if (!order) return;

  console.log(order); // 👈 keep this for debugging

  const items = order.items || [];
  const totalItems = order.items.reduce(
  (sum, item) => sum + item.quantity, 0
);

const totalAmount = order.items.reduce(
  (sum, item) => sum + (item.price * item.quantity), 0
);

  if (items.length === 0) {
    alert("No items found in this order");
    return;
  }

  const itemsHtml = items.map(item => `
    <tr>
<td>${item.name}</td>
<td style="text-align:center;">${item.quantity}</td>
<td style="text-align:right;">₹${item.price}</td>
    </tr>
  `).join("");

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" onclick="closeOrderItemsModal()"></div>
    <div class="modal">
      <h3>Order Items</h3>

      <table class="data-table">
        <thead>
          <tr>
            <th style="text-align:left;">Product</th>
<th style="text-align:center;">Qty</th>
<th style="text-align:right;">Price (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
<tfoot>
  <tr style="border-top:2px solid #ddd;">
    <td><strong>Total</strong></td>
    <td style="text-align:center;"><strong>${totalItems}</strong></td>
    <td style="text-align:right;"><strong>₹${totalAmount}</strong></td>
  </tr>
</tfoot>
      </table>


  `);
}
function closeOrderItemsModal() {
  document.querySelector(".modal")?.remove();
  document.querySelector(".modal-backdrop")?.remove();
}