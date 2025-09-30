// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyBrXBSKR63mDmDIjA18LntVfvEQmZAdcsA",
  authDomain: "dwarcrafts-marketplace.firebaseapp.com",
  projectId: "dwarcrafts-marketplace",
  storageBucket: "dwarcrafts-marketplace.firebasestorage.app",
  messagingSenderId: "251525912015",
  appId: "1:251525912015:web:5f19e3963c4254e48beeba",
  measurementId: "G-C3L7WQE92C"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Preview uploaded image
document.getElementById("uploadImage").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById("previewSection").style.display = "block";
      document.getElementById("previewImg").src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Auto calculate price
document.getElementById("basePrice").addEventListener("input", () => {
  const base = parseFloat(document.getElementById("basePrice").value) || 0;
  const profit = base * 0.2; // 20% profit margin
  const total = base + profit;
  const deposit = total * 0.3;
  document.getElementById("totalPrice").textContent = total.toFixed(0);
  document.getElementById("depositPrice").textContent = deposit.toFixed(0);
});

// Handle submit
document.getElementById("generatorForm").addEventListener("submit", async e => {
  e.preventDefault();

  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const dimensions = document.getElementById("dimensions").value;
  const basePrice = parseFloat(document.getElementById("basePrice").value);
  const profit = basePrice * 0.2;
  const total = basePrice + profit;
  const deposit = total * 0.3;

  const file = document.getElementById("uploadImage").files[0];
  let imageUrl = "";

  try {
    if (file) {
      const storageRef = ref(storage, `orders/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    const order = {
      category,
      description,
      dimensions,
      basePrice,
      total,
      deposit,
      imageUrl,
      status: "Pending",
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "orders"), order);
    alert("Order placed successfully! You’ll receive WhatsApp confirmation soon.");
    e.target.reset();
    document.getElementById("previewSection").style.display = "none";
    document.getElementById("totalPrice").textContent = "0";
    document.getElementById("depositPrice").textContent = "0";

    // 👉 Later: send WhatsApp confirmation here
  } catch (err) {
    console.error("Error saving order:", err);
    alert("Error placing order.");
  }
});
