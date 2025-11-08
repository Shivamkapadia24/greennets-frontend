// products-page.js - Advanced filtering and product management
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    // Initialize all products
    loadAllProducts();
    
    // Setup event listeners
    setupFilters();
    setupSearch();
    setupSorting();
    setupQuickView();
}

function loadAllProducts() {
    // This would typically load from an API or database
    // For demo, we'll use sample products
    const productsGrid = document.getElementById('allProductsGrid');
    
    // Sample products data (in real app, this would come from backend)
    const sampleProducts = [
        // Shade Nets
        { id: 1, name: "100% Premium Green Shade Net - 4x6m", category: "shade-nets", shade: "100", price: 1899, rating: 4.5, image: "shade-net-100.jpg", size: "small" },
        { id: 2, name: "90% Premium Green Shade Net - 6x8m", category: "shade-nets", shade: "90", price: 2199, rating: 4.8, image: "shade-net-90.jpg", size: "medium" },
        { id: 3, name: "75% Premium Green Shade Net - 4x6m", category: "shade-nets", shade: "75", price: 1299, rating: 4.7, image: "shade-net-75.jpg", size: "small" },
        { id: 4, name: "50% Economy Green Shade Net - 4x6m", category: "shade-nets", shade: "50", price: 999, rating: 4.2, image: "shade-net-50.jpg", size: "small" },
        
        // Tarpaulins
        { id: 5, name: "Heavy Duty Tarpaulin - 12x16 ft", category: "tarpaulins", price: 899, rating: 4.4, image: "tarpaulin-1.jpg", size: "large" },
        { id: 6, name: "Waterproof Tarpaulin - 10x12 ft", category: "tarpaulins", price: 749, rating: 4.6, image: "tarpaulin-2.jpg", size: "medium" },
        
        // Accessories
        { id: 7, name: "Installation Clips - Pack of 50", category: "accessories", price: 299, rating: 4.3, image: "clips.jpg" },
        { id: 8, name: "Heavy Duty Rope - 50m", category: "accessories", price: 199, rating: 4.5, image: "rope.jpg" }
    ];
    
    // Render products
    renderProducts(sampleProducts);
}

function setupFilters() {
    const applyBtn = document.querySelector('.apply-filters');
    const resetBtn = document.querySelector('.reset-filters');
    
    applyBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', resetFilters);
}

function applyFilters() {
    // Get all filter values
    const categories = getSelectedCheckboxes('category');
    const shades = getSelectedCheckboxes('shade');
    const sizes = getSelectedCheckboxes('size');
    const priceRange = document.getElementById('priceRange').value;
    
    // Filter logic would go here
    console.log('Applying filters:', { categories, shades, sizes, priceRange });
    
    // In real implementation, this would filter the product list
}

function resetFilters() {
    // Reset all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Reset price slider
    document.getElementById('priceRange').value = 10000;
    
    // Reapply filters
    applyFilters();
}

function getSelectedCheckboxes(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function setupSearch() {
    const searchInput = document.getElementById('productSearch');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Filter products based on search term
        filterProductsBySearch(searchTerm);
    });
}

function filterProductsBySearch(term) {
    // Implementation for search filtering
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        if (title.includes(term)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function setupQuickView() {
    // Quick view functionality
    const quickViewBtns = document.querySelectorAll('.quick-view-btn');
    const quickViewModal = document.getElementById('quickViewModal');
    const closeModal = document.querySelector('.close-modal');
    
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            openQuickView(productCard);
        });
    });
    
    closeModal.addEventListener('click', function() {
        quickViewModal.classList.remove('active');
    });
    
    quickViewModal.addEventListener('click', function(e) {
        if (e.target === quickViewModal) {
            quickViewModal.classList.remove('active');
        }
    });
}

function openQuickView(productCard) {
    const modal = document.getElementById('quickViewModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Get product details from the card
    const productName = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.current-price').textContent;
    const productImage = productCard.querySelector('img').src;
    
    // Populate modal with product details
    modalBody.innerHTML = `
        <div class="quick-view-content">
            <div class="product-images">
                <img src="${productImage}" alt="${productName}">
            </div>
            <div class="product-details">
                <h2>${productName}</h2>
                <div class="price">${productPrice}</div>
                <div class="description">
                    <p>High-quality product with excellent durability and performance.</p>
                </div>
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <input type="number" value="1" min="1">
                </div>
                <button class="btn add-to-cart-large">Add to Cart</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function renderProducts(products) {
    const grid = document.getElementById('allProductsGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
    
    // Update results count
    document.getElementById('resultsCount').textContent = products.length;
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-img">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-actions">
                <div class="product-action wishlist-btn"><i class="far fa-heart"></i></div>
                <div class="product-action quick-view-btn"><i class="fas fa-search"></i></div>
                <div class="product-action share-btn"><i class="fas fa-share-alt"></i></div>
            </div>
        </div>
        <div class="product-content">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                ${generateStarRating(product.rating)}
                <span>(${Math.floor(Math.random() * 50) + 10})</span>
            </div>
            <div class="product-price">
                <span class="current-price">₹${product.price}</span>
            </div>
            <button class="add-to-cart">Add to Cart</button>
        </div>
    `;
    
    return card;
}

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}