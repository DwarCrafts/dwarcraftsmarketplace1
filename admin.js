import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrXBSKR63mDmDIjA18LntVfvEQmZAdcsA",
  authDomain: "dwarcrafts-marketplace.firebaseapp.com",
  projectId: "dwarcrafts-marketplace",
  storageBucket: "dwarcrafts-marketplace.appspot.com",
  messagingSenderId: "251525912015",
  appId: "1:251525912015:web:5f19e3963c4254e48beeba",
  measurementId: "G-C3L7WQE92C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch Orders
async function loadOrders() {
  const ordersTable = document.getElementById("ordersTable");
  ordersTable.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "orders"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${data.name}</td>
      <td>${data.category}</td>
      <td>${data.wood}</td>
      <td>${data.status}</td>
      <td><a href="${data.imageUrl}" target="_blank">View Image</a></td>
      <td>
        <select class="form-select statusSelect" data-id="${docSnap.id}">
          <option ${data.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${data.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${data.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
      </td>
    `;
    ordersTable.appendChild(row);
  });

  // Attach event listeners for status change
  document.querySelectorAll(".statusSelect").forEach(select => {
    select.addEventListener("change", async (e) => {
      const id = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      alert("Order status updated ✅");
    });
  });
}

loadOrders();
