document.addEventListener('DOMContentLoaded', () => {
    // ✅ Fixed API endpoints (trailing slash included)
    const PRODUCT_API_BASE_URL = '/api/products/';
    const ORDER_API_BASE_URL = '/api/orders/';
    const CUSTOMER_API_BASE_URL = '/api/customers/';

    // DOM Elements
    const messageBox = document.getElementById('message-box');
    const productForm = document.getElementById('product-form');
    const productListDiv = document.getElementById('product-list');
    const customerForm = document.getElementById('customer-form');
    const customerListDiv = document.getElementById('customer-list');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const placeOrderForm = document.getElementById('place-order-form');
    const orderListDiv = document.getElementById('order-list');

    let cart = [];
    let productsCache = {};

    function showMessage(message, type = 'info') {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }

    function formatCurrency(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    }

    // --- Product Service ---
    async function fetchProducts() {
        productListDiv.innerHTML = '<p>Loading products...</p>';
        try {
            const response = await fetch(PRODUCT_API_BASE_URL); // ✅ no extra slash
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            productListDiv.innerHTML = '';
            productsCache = {};

            if (products.length === 0) {
                productListDiv.innerHTML = '<p>No products available yet. Add some above!</p>';
                return;
            }

            products.forEach(product => {
                productsCache[product.product_id] = product;
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

                productCard.innerHTML = `
                    <img src="${product.image_url || 'https://placehold.co/300x200/cccccc/333333?text=No+Image'}" alt="${product.name}" />
                    <h3>${product.name} (ID: ${product.product_id})</h3>
                    <p>${product.description || 'No description available.'}</p>
                    <p class="price">${formatCurrency(product.price)}</p>
                    <p class="stock">Stock: ${product.stock_quantity}</p>
                    <div class="card-actions">
                        <button class="add-to-cart-btn" data-id="${product.product_id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                        <button class="delete-btn" data-id="${product.product_id}">Delete</button>
                    </div>
                `;
                productListDiv.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            showMessage(`Failed to load products: ${error.message}`, 'error');
        }
    }

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock_quantity = parseInt(document.getElementById('product-stock').value, 10);
        const description = document.getElementById('product-description').value;

        const newProduct = { name, price, stock_quantity, description };

        try {
            const response = await fetch(PRODUCT_API_BASE_URL, { // ✅ fixed
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            });

            if (!response.ok) throw new Error(await response.text());
            await response.json();
            showMessage(`Product "${name}" added successfully!`, 'success');
            productForm.reset();
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            showMessage(`Error adding product: ${error.message}`, 'error');
        }
    });

    productListDiv.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const productId = event.target.dataset.id;
            try {
                const response = await fetch(`${PRODUCT_API_BASE_URL}${productId}`, { // ✅ fixed
                    method: 'DELETE',
                });
                if (response.status === 204) {
                    showMessage(`Product ID: ${productId} deleted successfully.`, 'success');
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.dataset.id;
            const productName = event.target.dataset.name;
            const productPrice = parseFloat(event.target.dataset.price);
            addToCart(productId, productName, productPrice);
        }
    });

    function addToCart(productId, productName, productPrice) {
        const existing = cart.find(item => item.product_id === productId);
        if (existing) existing.quantity += 1;
        else cart.push({ product_id: productId, name: productName, price: productPrice, quantity: 1 });
        updateCartDisplay();
    }

    function updateCartDisplay() {
        cartItemsList.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const li = document.createElement('li');
            const subtotal = item.quantity * item.price;
            total += subtotal;
            li.innerHTML = `${item.name} (x${item.quantity}) - ${formatCurrency(subtotal)}`;
            cartItemsList.appendChild(li);
        });
        cartTotalSpan.textContent = `Total: ${formatCurrency(total)}`;
    }

    // --- Customer Service ---
    async function fetchCustomers() {
        customerListDiv.innerHTML = '<p>Loading customers...</p>';
        try {
            const response = await fetch(CUSTOMER_API_BASE_URL); // ✅ fixed
            if (!response.ok) throw new Error(await response.text());
            const customers = await response.json();
            customerListDiv.innerHTML = '';
            customers.forEach(c => {
                const div = document.createElement('div');
                div.textContent = `${c.first_name} ${c.last_name} (${c.email})`;
                customerListDiv.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }

    // --- Order Service ---
    async function fetchOrders() {
        orderListDiv.innerHTML = '<p>Loading orders...</p>';
        try {
            const response = await fetch(ORDER_API_BASE_URL); // ✅ fixed
            if (!response.ok) throw new Error(await response.text());
            const orders = await response.json();
            orderListDiv.innerHTML = '';
            orders.forEach(o => {
                const div = document.createElement('div');
                div.textContent = `Order ${o.order_id} - Status: ${o.status}`;
                orderListDiv.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }

    // Initial loads
    fetchProducts();
    fetchCustomers();
    fetchOrders();

    setInterval(fetchOrders, 10000);
    setInterval(fetchProducts, 15000);
});
