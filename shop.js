// shop.js
import { app, db, storage } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const uploadForm = document.getElementById("uploadForm");
const productsGrid = document.getElementById("productsGrid");

// --- Upload New Product (Admin Only) ---
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.getElementById("category").value.trim();
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const imageFile = document.getElementById("image").files[0];

  if (!category || !name || !price || !imageFile) {
    alert("Please fill all fields and select an image.");
    return;
  }

  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, "products/" + Date.now() + "-" + imageFile.name);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Save product in Firestore
    await addDoc(collection(db, "products"), {
      category,
      name,
      price: Number(price),
      imageUrl,
      createdAt: new Date()
    });

    alert("✅ Product uploaded successfully!");
    uploadForm.reset();
    loadProducts(); // Refresh products
  } catch (error) {
    console.error("❌ Error uploading product:", error);
    alert("Failed to upload product. Check console for details.");
  }
});

// --- Load Products into Grid ---
async function loadProducts() {
  productsGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    productsGrid.innerHTML = ""; // Clear before rendering

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>KES ${product.price.toLocaleString()}</p>
        <small>${product.category}</small>
      `;
      productsGrid.appendChild(card);
    });

    if (productsGrid.innerHTML === "") {
      productsGrid.innerHTML = "<p>No products available yet.</p>";
    }
  } catch (error) {
    console.error("❌ Error loading products:", error);
    productsGrid.innerHTML = "<p>Failed to load products.</p>";
  }
}

// Load products when page is opened
window.onload = loadProducts;
