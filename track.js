// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
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

// Elements
const trackBtn = document.getElementById('trackBtn');
const orderIdInput = document.getElementById('orderIdInput');
const orderDetails = document.getElementById('orderDetails');
const trackProduct = document.getElementById('trackProduct');
const trackPrice = document.getElementById('trackPrice');
const trackStatus = document.getElementById('trackStatus');
const trackHistory = document.getElementById('trackHistory');

// Handle track order
trackBtn.addEventListener('click', async () => {
  const orderId = orderIdInput.value.trim();
  if (!orderId.startsWith("DCs")) {
    return alert("Tracking code must start with DCs");
  }

  const docRef = doc(db, "orders", orderId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("No order found with that tracking code.");
    orderDetails.style.display = "none";
    return;
  }

  const data = docSnap.data();
  trackProduct.textContent = data.productName || "";
  trackPrice.textContent = data.price || "";
  trackStatus.textContent = data.status || "Pending";

  trackHistory.innerHTML = "";
  (data.tracking || []).forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    trackHistory.appendChild(li);
  });

  orderDetails.style.display = "block";
});
