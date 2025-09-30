// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config (same as admin.js)
const firebaseConfig = {
  apiKey: "AIzaSyBrXBSKR63mDmDIjA18LntVfvEQmZAdcsA",
  authDomain: "dwarcrafts-marketplace.firebaseapp.com",
  projectId: "dwarcrafts-marketplace",
  storageBucket: "dwarcrafts-marketplace.appspot.com",
  messagingSenderId: "251525912015",
  appId: "1:251525912015:web:5f19e3963c4254e48beeba",
  measurementId: "G-C3L7WQE92C"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML elements
const categoryFilter = document.getElementById('categoryFilter');
const productGrid = document.getElementById('productGrid');
const submitOrderBtn = document.getElementById('submitOrderBtn');
const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));

// GLOBAL
let allProducts = [];

// Load categories
onSnapshot(collection(db, 'categories'), snapshot => {
  categoryFilter.innerHTML = `<option value="">All Categories</option>`;
  snapshot.forEach(docSnap => {
    const option = document.createElement('option');
    option.value = docSnap.id;
    option.textContent = docSnap.data().name;
    categoryFilter.appendChild(option);
  });
});

// Load products
onSnapshot(collection(db, 'products'), snapshot => {
  allProducts = [];
  snapshot.forEach(docSnap => {
    allProducts.push({ id: docSnap.id, ...docSnap.data() });
  });
  displayProducts();
});

// Display products
function displayProducts() {
  productGrid.innerHTML = '';
  const selectedCat = categoryFilter.value;
  const filtered = selectedCat ? allProducts.filter(p => p.categoryId === selectedCat) : allProducts;

  filtered.forEach(prod => {
    const div = document.createElement('div');
    div.className = 'col-md-4';
    div.innerHTML = `
      <div class="product-card">
        <img src="${prod.imageUrl}" alt="${prod.name}">
        <h5 class="mt-2">${prod.name}</h5>
        <p>${prod.description || ''}</p>
        <strong>KES ${prod.price}</strong>
        <br><button class="btn btn-success mt-2 orderBtn" data-id="${prod.id}">Order Now</button>
      </div>
    `;
    productGrid.appendChild(div);
  });

  // attach order buttons
  document.querySelectorAll('.orderBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const prodId = e.target.getAttribute('data-id');
      document.getElementById('orderProductId').value = prodId;
      orderModal.show();
    });
  });
}

// Filter change
categoryFilter.addEventListener('change', displayProducts);

// Submit order
submitOrderBtn.addEventListener('click', async () => {
  const prodId = document.getElementById('orderProductId').value;
  const customerName = document.getElementById('customerName').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const customerAddress = document.getElementById('customerAddress').value.trim();

  if (!customerName || !customerPhone || !customerAddress) {
    return alert('Please fill all fields');
  }

  const product = allProducts.find(p => p.id === prodId);
  if (!product) return;

  await addDoc(collection(db, 'orders'), {
    productId: prodId,
    productName: product.name,
    price: product.price,
    customerName,
    customerPhone,
    customerAddress,
    status: 'Pending',
    tracking: []
  });

  alert('Order placed successfully!');
  orderModal.hide();
  document.getElementById('customerName').value = '';
  document.getElementById('customerPhone').value = '';
  document.getElementById('customerAddress').value = '';
});
