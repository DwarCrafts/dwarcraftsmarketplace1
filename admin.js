// Import Firebase modules
import { 
  getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot, getDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { app } from "./firebase-config.js";

// Firestore + Storage
const db = getFirestore(app);
const storage = getStorage(app);

// HTML ELEMENTS
const dragDrop = document.getElementById('dragDrop');
const productImage = document.getElementById('productImage');
const previewImg = document.getElementById('previewImg');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const uploadProductBtn = document.getElementById('uploadProductBtn');
const orderSearch = document.getElementById('orderSearch');

// =============== DRAG & DROP IMAGE HANDLER ===============
dragDrop.addEventListener('click', () => productImage.click());
dragDrop.addEventListener('dragover', e => { e.preventDefault(); dragDrop.classList.add('dragover'); });
dragDrop.addEventListener('dragleave', e => { e.preventDefault(); dragDrop.classList.remove('dragover'); });
dragDrop.addEventListener('drop', e => {
    e.preventDefault();
    dragDrop.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});
productImage.addEventListener('change', e => handleFile(e.target.files[0]));

function handleFile(file) {
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    productImage.files = dt.files;
    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = 'block';
}

// =============== ADD CATEGORY ===============
addCategoryBtn.addEventListener('click', async () => {
    const catName = document.getElementById('newCategory').value.trim();
    if (!catName) return alert('Enter a category name');
    try {
        await addDoc(collection(db, 'categories'), { name: catName });
        document.getElementById('newCategory').value = '';
    } catch (err) {
        console.error("Error adding category:", err);
        alert("Failed to add category");
    }
});

// =============== UPLOAD PRODUCT ===============
uploadProductBtn.addEventListener('click', async () => {
    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const categoryId = document.getElementById('productCategory').value;
    const imageFile = productImage.files[0];

    if (!name || !price || !categoryId || !imageFile) 
        return alert('Fill all fields');

    try {
        const imageRef = ref(storage, 'products/' + Date.now() + '-' + imageFile.name);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        await addDoc(collection(db, 'products'), { 
            name, 
            description: desc, 
            price, 
            categoryId, 
            imageUrl 
        });

        // Clear inputs
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productDesc').value = '';
        productImage.value = '';
        previewImg.style.display = 'none';
        alert("Product uploaded successfully!");
    } catch (err) {
        console.error("Error uploading product:", err);
        alert("Failed to upload product");
    }
});

// =============== REAL-TIME CATEGORY LIST ===============
const categoryCol = collection(db, 'categories');
onSnapshot(categoryCol, snapshot => {
    const catList = document.getElementById('categoryList');
    const selectCat = document.getElementById('productCategory');
    catList.innerHTML = '';
    selectCat.innerHTML = '<option value="">Select Category</option>';
    snapshot.forEach(docSnap => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = docSnap.data().name;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'btn btn-danger btn-sm';
        delBtn.onclick = async () => await deleteDoc(doc(db, 'categories', docSnap.id));

        li.appendChild(delBtn);
        catList.appendChild(li);

        const option = document.createElement('option');
        option.value = docSnap.id;
        option.textContent = docSnap.data().name;
        selectCat.appendChild(option);
    });
});

// =============== REAL-TIME PRODUCT LIST ===============
const productCol = collection(db, 'products');
onSnapshot(productCol, snapshot => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `<img src="${data.imageUrl}" class="product-img me-2" /> <strong>${data.name}</strong> - KSh ${data.price.toFixed(2)}`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-warning btn-sm ms-2';
        editBtn.onclick = async () => {
            const newPrice = prompt('Enter new price', data.price);
            const newDesc = prompt('Enter new description', data.description);
            if (newPrice && newDesc !== null) {
                await updateDoc(doc(db, 'products', docSnap.id), { 
                    price: parseFloat(newPrice), 
                    description: newDesc 
                });
            }
        };

        li.appendChild(editBtn);
        productList.appendChild(li);
    });
});

// =============== REAL-TIME ORDERS ===============
const orderCol = collection(db, 'orders');
let latestOrders = [];

onSnapshot(orderCol, snapshot => {
    latestOrders = snapshot.docs;
    renderOrders(snapshot.docs);
});

// RENDER ORDERS
function renderOrders(docs) {
    const ordersTable = document.getElementById('ordersTable');
    ordersTable.innerHTML = '';
    const searchTerm = orderSearch.value.toLowerCase();

    docs.forEach(docSnap => {
        const order = docSnap.data();
        if (
            searchTerm &&
            !order.customerName?.toLowerCase().includes(searchTerm) &&
            !order.productName?.toLowerCase().includes(searchTerm)
        ) return;

        const tr = document.createElement('tr');
        tr.dataset.id = docSnap.id;
        const trackingHistory = (order.tracking || []).join(' → ');

        tr.innerHTML = `
            <td>${docSnap.id}</td>
            <td>${order.customerName || ''}</td>
            <td>${order.productName || ''}</td>
            <td>KSh ${order.price || ''}</td>
            <td>${order.status || 'Pending'}</td>
            <td>${trackingHistory}</td>
            <td>
                <input type="text" placeholder="Status" class="form-control mb-1" id="status-${docSnap.id}">
                <input type="text" placeholder="Add tracking update" class="form-control mb-1" id="track-${docSnap.id}">
                <button class="btn btn-primary btn-sm" onclick="updateOrder('${docSnap.id}')">Update</button>
            </td>
        `;
        ordersTable.appendChild(tr);
    });
}

// SEARCH FILTER
orderSearch.addEventListener('input', () => renderOrders(latestOrders));

// =============== UPDATE ORDER FUNCTION ===============
window.updateOrder = async function(orderId) {
    const status = document.getElementById('status-' + orderId).value;
    const trackUpdate = document.getElementById('track-' + orderId).value;

    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.data();

        let tracking = orderData.tracking || [];
        if (trackUpdate) tracking.push(trackUpdate);

        await updateDoc(orderRef, { 
            status: status || orderData.status, 
            tracking 
        });
        alert('Order updated!');
    } catch (err) {
        console.error("Error updating order:", err);
        alert("Failed to update order");
    }
};
