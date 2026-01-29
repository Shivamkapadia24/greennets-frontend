document.addEventListener('DOMContentLoaded', function() {
    
    // --- STATE INITIALIZATION ---
    let cart = []; 
    let cartCount = 0; 
    let wishlist = JSON.parse(localStorage.getItem('greenNetsWishlist')) || [];
    let itemToAddAfterLogin = null; // Remembers the product ID
    
    let totalPrice = 0; // Initialize total price

    // --- DOM ELEMENTS (Declared ONCE) ---
    const cartDrawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.overlay');
    const closeCartBtn = document.querySelector('.close-cart');
    const floatingCartBtn = document.querySelector('.floating-cart');
    const cartIcon = document.querySelector('.cart-icon');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    const cartCountElement = document.querySelector('.cart-count');
    const notification = document.getElementById('notification');
    
    // Wishlist DOM Elements
    const wishlistDrawer = document.querySelector('.wishlist-drawer');
    const closeWishlistBtn = document.querySelector('.close-wishlist');
    const wishlistIcon = document.getElementById('header-wishlist-icon');
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    const wishlistCountElement = document.querySelector('.wishlist-count');

    // Login/Register Modal DOM Elements
    const loginModal = document.getElementById('login-modal');
    const userIconContainer = document.getElementById('user-icon-container'); // Container div
    const userIconItself = document.getElementById('user-icon-itself'); // The <i> tag
    const userDisplayName = document.getElementById('user-display-name'); // Span for name
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const logoutLink = document.getElementById('logout-link'); // Logout link inside dropdown
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Other Page Elements
    const mobileToggle = document.querySelector('.mobile-toggle');
    const shopNowBtn = document.getElementById('shopNowBtn');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');
    const newsletterForm = document.getElementById('newsletter-form');

        // Checkout DOM Elements
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    const checkoutForm = document.getElementById('checkout-form');

        const myOrdersLink = document.getElementById('my-orders-link');
    const ordersModal = document.getElementById('orders-modal');
    const ordersListContainer = document.getElementById('orders-list');
    const ordersCloseBtn = document.querySelector('.orders-close-btn');



    // --- UTILITY FUNCTIONS ---

    function getToken() {
        return localStorage.getItem('greenNetsToken');
    }
    

    
    function saveWishlist() {
        localStorage.setItem('greenNetsWishlist', JSON.stringify(wishlist));
        if (wishlistCountElement) {
            wishlistCountElement.textContent = wishlist.length;
        }
    }

    function showNotification(message) {
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    function updateHeaderUI() {
        const token = getToken();
        const userName = localStorage.getItem('greenNetsUserName');

        if (token && userName) {
            // Logged In State
            if (userIconItself) userIconItself.style.display = 'none'; 
            if (userDisplayName) {
                userDisplayName.textContent = `Hi, ${userName.split(' ')[0]}`; 
                userDisplayName.style.display = 'inline';
            }
            if (dropdownUserName) dropdownUserName.textContent = userName; 
            if (userDropdownMenu) userDropdownMenu.classList.remove('active'); 
        } else {
            // Logged Out State
            if (userIconItself) userIconItself.style.display = 'inline-block'; 
            if (userDisplayName) userDisplayName.style.display = 'none';
            if (userDropdownMenu) userDropdownMenu.classList.remove('active');
            if (dropdownUserName) dropdownUserName.textContent = 'User'; // Fix for logout bug
        }
         if (loginModal) loginModal.classList.remove('active');
    }

    // --- CORE FEATURE FUNCTIONS ---

    // Cart
    function openCart() {
        if (cartDrawer) cartDrawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        if (cartDrawer) cartDrawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

        // --- MY ORDERS ---

    function openOrdersModal() {
        const token = getToken();
        if (!token) {
            showNotification('Please log in to view your orders.');
            openLoginModal();
            return;
        }
        if (ordersModal) {
            ordersModal.classList.add('active');
        }
    }

    function closeOrdersModal() {
        if (ordersModal) {
            ordersModal.classList.remove('active');
        }
    }

    function renderOrdersList(orders) {
        if (!ordersListContainer) return;

        if (!orders || orders.length === 0) {
            ordersListContainer.innerHTML =
                '<p style="text-align: center; padding: 20px;">You have not placed any orders yet.</p>';
            return;
        }

        ordersListContainer.innerHTML = '';

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';

            const createdAt = order.createdAt
                ? new Date(order.createdAt)
                : null;

            const dateText = createdAt
                ? createdAt.toLocaleString()
                : 'Unknown date';

            const status = order.status || 'Pending';
            const total = order.totalAmount || 0;

            const header = document.createElement('div');
            header.className = 'order-card-header';
            header.innerHTML = `
                <div class="order-id">Order ID: ${order._id}</div>
                <span class="order-status">${status}</span>
            `;

            const meta = document.createElement('div');
            meta.className = 'order-meta';
            meta.textContent = `Placed on ${dateText} • Total: ₹${total.toLocaleString()}`;

            const itemsList = document.createElement('ul');
            itemsList.className = 'order-items';

            (order.items || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name} × ${item.quantity} (₹${item.price})`;
                itemsList.appendChild(li);
            });

            card.appendChild(header);
            card.appendChild(meta);
            card.appendChild(itemsList);

            ordersListContainer.appendChild(card);
        });
    }

    async function fetchAndShowOrders() {
        const token = getToken();
        if (!token) {
            showNotification('Please log in to view your orders.');
            openLoginModal();
            return;
        }

        if (ordersListContainer) {
            ordersListContainer.innerHTML =
                '<p style="text-align: center; padding: 20px;">Loading your orders...</p>';
        }

        try {
            const response = await fetch('http://localhost:5001/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData.message || 'Failed to fetch your orders.';
                showNotification(msg);
                if (ordersListContainer) {
                    ordersListContainer.innerHTML =
                        '<p style="text-align: center; padding: 20px;">Could not load orders.</p>';
                }
                return;
            }

            const orders = await response.json();
            renderOrdersList(orders);
            openOrdersModal();
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('Something went wrong while loading your orders.');
            if (ordersListContainer) {
                ordersListContainer.innerHTML =
                    '<p style="text-align: center; padding: 20px;">Could not load orders.</p>';
            }
        }
    }


        // Checkout Modal
    function openCheckoutModal() {
        const token = getToken();
        if (!token) {
            showNotification('Please log in to place an order.');
            openLoginModal();
            return;
        }

        if (checkoutModal) {
            checkoutModal.classList.add('active'); // you'll style .checkout-modal.active in CSS
        }
    }

    function closeCheckoutModal() {
        if (checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    }


    function updateCartDisplay() {
        if (!cartItemsContainer || !totalPriceElement) return;

        cartItemsContainer.innerHTML = '';
        totalPrice = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
            totalPriceElement.textContent = '₹0';
            return;
        }
        
        cart.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 0); // Add safety checks
            totalPrice += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">₹${(item.price || 0).toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        totalPriceElement.textContent = `₹${totalPrice.toLocaleString()}`;
    }

    // Local-only quantity update (fallback for +/- buttons)



    // API function to add to cart
    async function addItemToCartAPI(productId, quantity = 1) {
        const token = getToken();
        if (!token) {
            console.error("addItemToCartAPI called without a token.");
            showNotification('Please log in first.');
            openLoginModal();
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: productId, quantity: quantity })
            });

            const updatedCartData = await response.json();
            if (!response.ok) throw new Error(updatedCartData.message || `HTTP error! status: ${response.status}`);

            const productTitle = updatedCartData.find(item => item.product._id === productId)?.product.name || 'Item';
            
            cart = updatedCartData.map(item => ({ 
                  id: item.product._id, 
                  title: item.product.name,
                  price: item.product.price,
                  image: item.product.imageUrl || 'default-image.jpg', 
                  quantity: item.quantity
            }));
            cartCount = cart.reduce((total, item) => total + item.quantity, 0);

            if (cartCountElement) cartCountElement.textContent = cartCount;
            updateCartDisplay(); 
            showNotification(`${productTitle} added to cart!`);
            openCart();

        } catch (error) {
            console.error('Failed to add to cart:', error);
            showNotification(`Error adding item: ${error.message}`);
            if (error.message.includes('401') || error.message.toLowerCase().includes('token')) {
                 localStorage.removeItem('greenNetsToken');
                 localStorage.removeItem('greenNetsUserName');
                 updateHeaderUI();
                 openLoginModal();
            }
        }
    }

    // API function to remove from cart
    async function handleRemoveItem(productId, token) {
         try {
             const response = await fetch(`http://localhost:5001/api/cart/${productId}`, {
                 method: 'DELETE',
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             const updatedCartData = await response.json();
             if (!response.ok) throw new Error(updatedCartData.message || `HTTP error! status: ${response.status}`);

             cart = updatedCartData.map(item => ({ 
                   id: item.product._id, 
                   title: item.product.name,
                   price: item.product.price,
                   image: item.product.imageUrl || 'default-image.jpg', 
                   quantity: item.quantity
             }));
             cartCount = cart.reduce((total, item) => total + item.quantity, 0);

             if (cartCountElement) cartCountElement.textContent = cartCount;
             updateCartDisplay();
             showNotification('Item removed from cart.');

         } catch (error) {
             console.error('Failed to remove item:', error);
             showNotification(`Error removing item: ${error.message}`);
             if (error.message.includes('401') || error.message.toLowerCase().includes('token')) {
                  localStorage.removeItem('greenNetsToken');
                  localStorage.removeItem('greenNetsUserName');
                  updateHeaderUI();
                  openLoginModal();
             }
         }
    }
    
    // API function to update quantity
    async function handleUpdateQuantity(productId, newQuantity, token) {
        try {
            const response = await fetch(`http://localhost:5001/api/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity }) // Send the new quantity
            });

            const updatedCartData = await response.json();
            if (!response.ok) throw new Error(updatedCartData.message || `HTTP error! status: ${response.status}`);

            cart = updatedCartData.map(item => ({ 
                 id: item.product._id, 
                 title: item.product.name,
                 price: item.product.price,
                 image: item.product.imageUrl || 'default-image.jpg', 
                 quantity: item.quantity
            }));
            cartCount = cart.reduce((total, item) => total + item.quantity, 0);

            if (cartCountElement) cartCountElement.textContent = cartCount;
            updateCartDisplay();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            showNotification(`Error updating quantity: ${error.message}`);
            if (error.message.includes('401') || error.message.toLowerCase().includes('token')) {
                 localStorage.removeItem('greenNetsToken');
                 localStorage.removeItem('greenNetsUserName');
                 updateHeaderUI();
                 openLoginModal();
            }
        }
    }

    // Wishlist
    function openWishlist() {
        if (wishlistDrawer) wishlistDrawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeWishlist() {
        if (wishlistDrawer) wishlistDrawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function updateWishlistDisplay() {
        if (!wishlistItemsContainer) return;
        wishlistItemsContainer.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your wishlist is empty</p>';
            return;
        }
        wishlist.forEach(item => {
            const wishlistItemElement = document.createElement('div');
            wishlistItemElement.className = 'cart-item';
            wishlistItemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">₹${(item.price || 0).toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <button class="remove-from-wishlist" data-id="${item.id}"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                </div>
            `;
            wishlistItemsContainer.appendChild(wishlistItemElement);
        });
    }

    // API function to remove from wishlist
    async function handleRemoveFromWishlist(productId, token) {
         try {
             const response = await fetch(`http://localhost:5001/api/wishlist/${productId}`, {
                 method: 'DELETE',
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             const updatedWishlistData = await response.json();

             if (!response.ok) {
                 if (response.status === 404) {
                      console.warn("Item not found on backend, updating UI.");
                      wishlist = wishlist.filter(item => item.id !== productId);
                 } else {
                     throw new Error(updatedWishlistData.message || `HTTP error! status: ${response.status}`);
                 }
             } else {
                wishlist = updatedWishlistData.map(item => ({ 
                    id: item._id, 
                    title: item.name,
                    price: item.price,
                    image: item.imageUrl || 'default-image.jpg'
                }));
             }
             updateWishlistDisplay();
             saveWishlist(); // Updates header count
             updateWishlistIconsOnCards(); 
             showNotification('Item removed from wishlist.');
         } catch (error) {
             console.error('Failed to remove item from wishlist:', error);
             showNotification(`Error removing item: ${error.message}`);
             if (error.message.includes('401') || error.message.toLowerCase().includes('token')) {
                  localStorage.removeItem('greenNetsToken');
                  localStorage.removeItem('greenNetsUserName');
                  updateHeaderUI();
                  openLoginModal();
             }
         }
    }

    // Function to update heart icons on all cards
    function updateWishlistIconsOnCards() {
        const allWishlistButtons = document.querySelectorAll('.wishlist-btn');
        allWishlistButtons.forEach(button => {
            const productCard = button.closest('.product-card');
            const productId = productCard ? (productCard.dataset.productId || productCard.dataset.id) : null;
            const icon = button.querySelector('i');
            if (productId && icon) {
                // Ensure button's dataset.id is also set for consistency
                button.dataset.id = productId;
                const isInWishlist = wishlist.some(item => item.id === productId);
                if (isInWishlist) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
        });
    }


    // Login/Modal
    function openLoginModal() {
        if (loginModal) loginModal.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLoginModal() {
        if (loginModal) loginModal.classList.remove('active');
        if (!cartDrawer.classList.contains('active') && !wishlistDrawer.classList.contains('active')) {
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Search
    function handleSearch() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    // --- EVENT LISTENERS (Centralized) ---

    // Event Delegation for dynamic Product Cards
    document.body.addEventListener('click', async function(e) {
        
        // --- Add to Cart Delegation ---
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            const token = getToken();
            const productCard = addToCartBtn.closest('.product-card');
            const productId = productCard.dataset.productId; 

            if (!productId) {
                 console.error("Product ID missing on card:", productCard);
                 showNotification("Error: Could not identify product.");
                 return;
            }
            
            if (token) {
                await addItemToCartAPI(productId, 1);
            } else {
                itemToAddAfterLogin = productId; 
                showNotification('Please log in to add items to your cart.');
                openLoginModal();
            }
        }

        // --- Wishlist Button Delegation ---
        const wishlistBtn = e.target.closest('.wishlist-btn');
        if (wishlistBtn) {
            e.preventDefault();
            const productCard = wishlistBtn.closest('.product-card');
            const token = getToken();

            if (!token) {
                showNotification('Please log in to manage your wishlist.');
                openLoginModal();
                return;
            }

            let productId = productCard.dataset.productId;
            if (!productId) productId = productCard.dataset.id; // Fallback

            const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(productId);
            if (!isValidMongoId) {
                 showNotification("This item cannot be added to a wishlist (invalid ID).");
                 console.warn("Wishlist click on non-DB item:", productId);
                 return;
            }

            const icon = wishlistBtn.querySelector('i');
            const isInWishlist = icon.classList.contains('fas'); 
            const method = isInWishlist ? 'DELETE' : 'POST';
            const url = isInWishlist ? `http://localhost:5001/api/wishlist/${productId}` : 'http://localhost:5001/api/wishlist';

            try {
                const fetchOptions = {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                if (method === 'POST') {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                    fetchOptions.body = JSON.stringify({ productId: productId });
                }

                const response = await fetch(url, fetchOptions);
                const updatedWishlistData = await response.json();

                if (!response.ok) {
                    if (method === 'DELETE' && response.status === 404) {
                         console.warn("Item not found on backend, updating UI.");
                         wishlist = wishlist.filter(item => item.id !== productId);
                    } else {
                        throw new Error(updatedWishlistData.message || `HTTP error! status: ${response.status}`);
                    }
                } else {
                    wishlist = updatedWishlistData.map(item => ({ 
                        id: item._id, 
                        title: item.name,
                        price: item.price,
                        image: item.imageUrl || 'default-image.jpg'
                    }));
                }
                
                if (isInWishlist) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showNotification('Removed from wishlist');
                } else {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showNotification('Added to wishlist');
                }
                updateWishlistDisplay();
                saveWishlist(); // Updates header count

            } catch (error) {
                console.error('Failed to update wishlist:', error);
                showNotification(`Error: ${error.message}`);
                 if (error.message.includes('401') || error.message.toLowerCase().includes('token')) {
                      localStorage.removeItem('greenNetsToken');
                      localStorage.removeItem('greenNetsUserName');
                      updateHeaderUI();
                      openLoginModal();
                 }
            }
        }

        // --- Quick View Delegation (Placeholder) ---
        const quickViewBtn = e.target.closest('.quick-view-btn');
        if (quickViewBtn) {
            e.preventDefault();
            const productCard = quickViewBtn.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            showNotification(`Quick view: ${productTitle}`);
        }

        // --- Share Button Delegation (Placeholder) ---
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            e.preventDefault();
            const productCard = shareBtn.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            showNotification(`Share: ${productTitle}`);
        }
    });

    // Cart Item Buttons (+, -, remove)
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', async function(e) { 
            const token = getToken(); 
            if (!token) { openLoginModal(); return; }

            const minusBtn = e.target.closest('.minus-btn');
            const plusBtn = e.target.closest('.plus-btn');
            const removeBtn = e.target.closest('.remove-item');

            if (minusBtn || plusBtn) {
                 const productId = (minusBtn || plusBtn).dataset.id;
                 const change = minusBtn ? -1 : 1;
                 const currentItem = cart.find(item => item.id === productId);
                 if (!currentItem) return; 
                 
                 const newQuantity = currentItem.quantity + change;

                 if (newQuantity <= 0) {
                     await handleRemoveItem(productId, token);
                 } else {
                     await handleUpdateQuantity(productId, newQuantity, token);
                 }
                 return; 
            }

            if (removeBtn) {
                 const productId = removeBtn.dataset.id;
                 await handleRemoveItem(productId, token);
            }
        });
    }
    
    // Wishlist Drawer Removal
    if (wishlistItemsContainer) {
        wishlistItemsContainer.addEventListener('click', async function(e) {
            const removeButton = e.target.closest('.remove-from-wishlist');
            if (removeButton) {
                const token = getToken(); 
                if (!token) { openLoginModal(); return; } 
                const productId = removeButton.dataset.id;
                await handleRemoveFromWishlist(productId, token); 
            }
        });
    }

    // Modal/Drawer Toggle Listeners
    if (mobileToggle) mobileToggle.addEventListener('click', () => document.querySelector('.main-nav').classList.toggle('active'));
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (floatingCartBtn) floatingCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (wishlistIcon) wishlistIcon.addEventListener('click', openWishlist);
    if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlist);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeLoginModal);

        // Checkout button in cart footer
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            openCheckoutModal();
        });
    }

    // Close button in checkout modal
    if (checkoutCloseBtn) {
        checkoutCloseBtn.addEventListener('click', function () {
            closeCheckoutModal();
        });
    }

        // My Orders link
    if (myOrdersLink) {
        myOrdersLink.addEventListener('click', function (e) {
            e.preventDefault();
            fetchAndShowOrders();
            if (userDropdownMenu) userDropdownMenu.classList.remove('active');
        });
    }

    // Close My Orders modal
    if (ordersCloseBtn) {
        ordersCloseBtn.addEventListener('click', function () {
            closeOrdersModal();
        });
    }


        if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const token = getToken();
            if (!token) {
                showNotification('Please log in to place an order.');
                openLoginModal();
                return;
            }

            const fullName = document.getElementById('checkout-fullName').value.trim();
            const phone = document.getElementById('checkout-phone').value.trim();
            const addressLine1 = document.getElementById('checkout-address1').value.trim();
            const addressLine2 = document.getElementById('checkout-address2').value.trim();
            const city = document.getElementById('checkout-city').value.trim();
            const state = document.getElementById('checkout-state').value.trim();
            const pincode = document.getElementById('checkout-pincode').value.trim();
            const notes = document.getElementById('checkout-notes').value.trim();

            if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
                showNotification('Please fill all required fields.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5001/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fullName,
                        phone,
                        addressLine1,
                        addressLine2,
                        city,
                        state,
                        pincode,
                        notes
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    showNotification(data.message || 'Failed to place order.');
                    return;
                }

                showNotification('Order placed successfully! ✅');

                // Close modal and clear form
                closeCheckoutModal();
                checkoutForm.reset();

                // Refresh cart from server so it becomes empty
                if (typeof initializeUserState === 'function') {
                    await initializeUserState();
                } else {
                    // fallback if something goes wrong
                    cart = [];
                    cartCount = 0;
                
                    updateCartDisplay();
                    if (cartCountElement) cartCountElement.textContent = '0';
                }
            } catch (error) {
                console.error('Checkout error:', error);
                showNotification('Something went wrong while placing your order.');
            }
        });
    }

    
    if (overlay) {
        overlay.addEventListener('click', closeCart);
        overlay.addEventListener('click', closeWishlist);
        overlay.addEventListener('click', closeLoginModal);
    }
    
    // User Icon/Dropdown Logic
    if (userIconContainer) {
        userIconContainer.addEventListener('click', function(e) {
            if (userDropdownMenu && userDropdownMenu.contains(e.target)) return;
            const token = getToken();
            if (token) {
                if (userDropdownMenu) {
                    userDropdownMenu.classList.toggle('active');
                    if (userDropdownMenu.classList.contains('active')) {
                         closeCart();
                         closeWishlist();
                         closeLoginModal();
                    }
                }
            } else {
                openLoginModal();
                 if (userDropdownMenu) userDropdownMenu.classList.remove('active');
            }
        });
         document.addEventListener('click', function(e) {
             if (userDropdownMenu && !userIconContainer.contains(e.target) && userDropdownMenu.classList.contains('active')) {
                   userDropdownMenu.classList.remove('active');
             }
         });
    }

    // Form Switching (Login/Register)
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
        });
    }

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const email = emailInput ? emailInput.value : null;
            const password = passwordInput ? passwordInput.value : null;
            if (!email || !password) {
                showNotification('Email and password are required.');
                return;
            }
            try {
                const response = await fetch('http://localhost:5001/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password }),
                });
                const data = await response.json(); 
                if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);

                showNotification(`Welcome back, ${data.user.name}!`);
                localStorage.setItem('greenNetsToken', data.token);
                localStorage.setItem('greenNetsUserName', data.user.name);
                
                closeLoginModal(); 
                loginForm.reset(); 
                await initializeUserState(); 

                if (itemToAddAfterLogin) {
                    console.log(`Adding pending item to cart: ${itemToAddAfterLogin}`);
                    await addItemToCartAPI(itemToAddAfterLogin, 1);
                    itemToAddAfterLogin = null; 
                }
            } catch (error) {
                console.error('Login failed:', error);
                showNotification(`Login failed: ${error.message}`);
                if(passwordInput) passwordInput.value = '';
            }
        });
    }
    
    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const passwordInput = document.getElementById('register-password');
            
            const name = nameInput ? nameInput.value : null;
            const email = emailInput ? emailInput.value : null;
            const password = passwordInput ? passwordInput.value : null;

            if (!name || !email || !password) {
                showNotification('Please fill in all fields.');
                return; 
            }
            try {
                const response = await fetch('http://localhost:5001/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }), 
                });
                const data = await response.json(); 
                if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);

                showNotification('Registration successful! You can now log in.');
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                registerForm.reset(); 
                const loginEmailInput = document.getElementById('login-email');
                if (loginEmailInput) loginEmailInput.value = email;
            } catch (error) {
                console.error('Registration failed:', error);
                showNotification(`Registration failed: ${error.message}`);
                if(passwordInput) passwordInput.value = ''; 
            }
        });
    }

    // Logout Link
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('greenNetsToken'); 
            localStorage.removeItem('greenNetsUserName');
            cart = []; cartCount = 0; wishlist = [];

            updateHeaderUI(); 
            if (cartCountElement) cartCountElement.textContent = '0';
            if (wishlistCountElement) wishlistCountElement.textContent = '0';
            updateCartDisplay();
            updateWishlistDisplay();
            updateWishlistIconsOnCards();

            showNotification('You have been logged out.');
            if (userDropdownMenu) userDropdownMenu.classList.remove('active');
        });
    }

    // Homepage Placeholder Filters
    const filterButtons = document.querySelectorAll('.product-filters .filter-btn');
    filterButtons.forEach(button => {
        // This check ensures we don't add a *second* listener
        // to buttons that are handled by category-page.js
        if (button.closest('#category-filter-buttons') === null) { 
            const pageSpecificFilters = document.querySelector('.products-grid[data-category-page="true"]');
            if (!pageSpecificFilters) { // Only run on homepage
                button.addEventListener('click', function() {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    showNotification(`Showing ${this.textContent} products`);
                });
            }
        }
    });

    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect && sortSelect.id !== 'sortProducts') {
         sortSelect.addEventListener('change', function() {
            showNotification(`Products sorted by: ${this.value}`);
        });
    }

    // Newsletter Form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            showNotification(`Thank you for subscribing with ${email}`);
            this.reset();
        });
    }

    // Mobile Dropdowns
    const navItems = document.querySelectorAll('.main-nav > li');
    navItems.forEach(item => {
        if (item.querySelector('.dropdown')) {
            item.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    if (!this.classList.contains('active')) {
                         e.preventDefault();
                        navItems.forEach(i => i.classList.remove('active'));
                        this.classList.toggle('active');
                    }
                }
            });
        }
    });

    // Universal Search & Homepage Buttons
    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }});
    if (shopNowBtn) shopNowBtn.addEventListener('click', () => { window.location.href = 'products.html'; });
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            const aboutSection = document.querySelector('.about-us');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
// ===============================
// AI Chatbot
// ===============================
const API_BASE_URL = 'http://localhost:5001'; // adjust for production

const chatToggleButton = document.getElementById('chat-toggle-button');
const chatWidget = document.getElementById('chat-widget');
const chatCloseButton = document.getElementById('chat-close-btn');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');
const chatWelcome = document.getElementById('chat-welcome');
const chatSuggestionsContainer = document.getElementById('chat-suggestions');

let hasGreeted = false;
let isRequestInFlight = false;

function openChat() {
  if (!chatWidget) return;
  chatWidget.classList.add('active');
  chatWidget.setAttribute('aria-hidden', 'false');

  if (!hasGreeted) {
    displayMessage('👋 Hi! I’m GreenNets AI. How can I help you today?', 'bot');
    hasGreeted = true;
  }

  if (chatInput) {
    setTimeout(() => chatInput.focus(), 150);
  }
}

function closeChat() {
  if (!chatWidget) return;
  chatWidget.classList.remove('active');
  chatWidget.setAttribute('aria-hidden', 'true');
}

function displayMessage(message, sender) {
  if (!chatMessages) return;

  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${sender}`;

  // USER messages stay simple
  if (sender === 'user') {
    const textDiv = document.createElement('div');
    textDiv.className = 'chat-text';
    textDiv.innerText = message;
    wrapper.appendChild(textDiv);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }

  // BOT messages: detect [Tag] [Tag] line at the top
  const lines = message.split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

  let tags = [];
  let remainingText = message;

  if (nonEmptyLines.length > 0) {
    const firstLine = nonEmptyLines[0];
    const tagRegex = /\[([^\]]+)\]/g;
    let match;
    const foundTags = [];

    while ((match = tagRegex.exec(firstLine)) !== null) {
      foundTags.push(match[1].trim());
    }

    if (foundTags.length > 0) {
      tags = foundTags;

      // Remove that first line from the message for main text
      const firstLineIndex = lines.indexOf(firstLine);
      const linesWithoutFirst =
        firstLineIndex >= 0
          ? lines.slice(0, firstLineIndex).concat(lines.slice(firstLineIndex + 1))
          : lines;
      remainingText = linesWithoutFirst.join('\n').trim();
    }
  }

  // If we have tags, render them as chips
  if (tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'chat-tags';

    tags.forEach((tagText) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'chat-tag';
      tagEl.innerText = tagText; // safe, we control the format
      tagsContainer.appendChild(tagEl);
    });

    wrapper.appendChild(tagsContainer);
  }

  // Main bot text
  if (remainingText) {
    const textDiv = document.createElement('div');
    textDiv.className = 'chat-text';
    textDiv.innerText = remainingText; // still using innerText -> safe
    wrapper.appendChild(textDiv);
  }

  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayBotMessage(message, recommendedProducts) {
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message bot';

    const textElement = document.createElement('div');
    textElement.className = 'chat-message-text';
    textElement.innerText = message;
    messageElement.appendChild(textElement);

    // If we have recommendations, render them as buttons
    if (Array.isArray(recommendedProducts) && recommendedProducts.length > 0) {
        const recContainer = document.createElement('div');
        recContainer.className = 'chat-recommendations';

        const title = document.createElement('div');
        title.className = 'chat-rec-title';
        title.innerText = 'Recommended products:';
        recContainer.appendChild(title);

        recommendedProducts.forEach((name) => {
            const item = document.createElement('div');
            item.className = 'chat-rec-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'chat-rec-name';
            nameSpan.innerText = name;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chat-rec-btn';
            btn.innerText = 'Add to cart';

            btn.addEventListener('click', () => {
                handleRecommendationAddToCart(name);
            });

            item.appendChild(nameSpan);
            item.appendChild(btn);
            recContainer.appendChild(item);
        });

        messageElement.appendChild(recContainer);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



function addTypingIndicator() {
  if (!chatMessages) return;
  removeTypingIndicator();

  const typingEl = document.createElement('div');
  typingEl.className = 'chat-message bot typing-indicator';
  typingEl.innerHTML = '<span></span><span></span><span></span>';

  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  if (!chatMessages) return;
  const existing = chatMessages.querySelector('.typing-indicator');
  if (existing) existing.remove();
}

async function handleChatbotRequest(prompt) {
    if (!prompt) return;

    // Hide welcome block after first real question
    if (chatWelcome) {
        chatWelcome.style.display = 'none';
    }

    addTypingIndicator();

    try {
        const response = await fetch('http://localhost:5001/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt }),
        });

        removeTypingIndicator();

        if (!response.ok) {
            throw new Error('AI response was not ok.');
        }

        const data = await response.json();

        // New: if backend sends structured data, use it
        if (data && typeof data === 'object' && 'message' in data) {
            displayBotMessage(data.message, data.recommendedProducts || []);
        } else {
            // Fallback (just in case)
            displayMessage(String(data), 'bot');
        }
    } catch (error) {
        console.error('Error with chatbot:', error);
        removeTypingIndicator();
        displayMessage(
            'Sorry, I had trouble connecting to my brain. Please try again in a moment.',
            'bot'
        );
    }
}
async function handleRecommendationAddToCart(productName) {
    if (!productName) return;

    const token = getToken();
    if (!token) {
        showNotification('Please log in to add items to your cart.');
        openLoginModal();
        return;
    }

    try {
        // Find product by name using your /api/products search route
        const response = await fetch(
            `http://localhost:5001/api/products?search=${encodeURIComponent(productName)}`
        );

        if (!response.ok) {
            throw new Error(`Unable to search product for "${productName}"`);
        }

        const products = await response.json();

        if (!Array.isArray(products) || products.length === 0) {
            showNotification(`Sorry, I couldn't find "${productName}" in the store.`);
            return;
        }

        // Prefer exact name match; else fallback to first result
        let product = products.find((p) => p.name === productName) || products[0];

        if (!product || !product._id) {
            showNotification(`Sorry, I couldn't identify the product "${productName}".`);
            return;
        }

        const productId = product._id;

        // Reuse your existing cart API helper
        await addItemToCartAPI(productId, 1);
    } catch (error) {
        console.error('Failed to add recommended product:', error);
        showNotification(`Error adding "${productName}" to cart: ${error.message}`);
    }
}


function sendUserMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  displayMessage(trimmed, 'user');
  handleChatbotRequest(trimmed);
}

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!chatInput) return;
    const userMessage = chatInput.value;
    chatInput.value = '';
    sendUserMessage(userMessage);
  });
}

// Enter to send, Shift+Enter for newline
if (chatInput && chatForm) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });
}

// Attach click handlers to example suggestion chips
if (chatSuggestionsContainer) {
  chatSuggestionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.chat-suggestion');
    if (!btn) return;
    const text = btn.textContent || btn.innerText;
    openChat();
    sendUserMessage(text);
  });
}

if (chatToggleButton) {
  chatToggleButton.addEventListener('click', () => {
    if (!chatWidget) return;
    if (chatWidget.classList.contains('active')) {
      closeChat();
    } else {
      openChat();
    }
  });
}

if (chatCloseButton) {
  chatCloseButton.addEventListener('click', () => closeChat());
}



    
    // --- INITIALIZE PAGE STATE ---
    async function initializeUserState() {
        const token = getToken();
        if (token) {
            console.log('User is logged in, fetching cart and wishlist...');
            try {
                // Fetch Cart
                const cartResponse = await fetch('http://localhost:5001/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (cartResponse.ok) {
                    const serverCart = await cartResponse.json();
                    cart = serverCart.map(item => ({ 
                         id: item.product._id, 
                         title: item.product.name,
                         price: item.product.price,
                         image: item.product.imageUrl || 'default-image.jpg', 
                         quantity: item.quantity
                    }));
                    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
                } else {
                    console.error('Failed to fetch cart:', cartResponse.statusText);
                     if (cartResponse.status === 401) {
                         localStorage.removeItem('greenNetsToken');
                         localStorage.removeItem('greenNetsUserName');
                     }
                }

                // Fetch Wishlist
                const wishlistResponse = await fetch('http://localhost:5001/api/wishlist', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (wishlistResponse.ok) {
                    const serverWishlist = await wishlistResponse.json();
                    wishlist = serverWishlist.map(item => ({ 
                        id: item._id, 
                        title: item.name,
                        price: item.price,
                        image: item.imageUrl || 'default-image.jpg'
                    }));
                } else {
                    console.error('Failed to fetch wishlist:', wishlistResponse.statusText);
                     if (wishlistResponse.status === 401 && !cartResponse.ok) { 
                         localStorage.removeItem('greenNetsToken');
                         localStorage.removeItem('greenNetsUserName');
                     }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        } else {
            console.log('User is not logged in.');
            cart = []; cartCount = 0; wishlist = []; 
        }

        // Update all UI elements
        if (cartCountElement) cartCountElement.textContent = cartCount;
        if (wishlistCountElement) wishlistCountElement.textContent = wishlist.length; 
        updateCartDisplay(); 
        updateWishlistDisplay(); 
        updateWishlistIconsOnCards();
        updateHeaderUI(); // Update header last
    }

    initializeUserState(); // Run initialization on page load

});