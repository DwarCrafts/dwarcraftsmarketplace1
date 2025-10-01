import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// 🔥 Firebase Config
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
const storage = getStorage(app);

// 🗂 Load Categories
async function loadCategories() {
  try {
    const res = await fetch("space.json");
    const categories = await res.json();
    const categorySelect = document.getElementById("projectCategory");
    categorySelect.innerHTML = "";
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
}
loadCategories();

// 📤 Form Submission
document.getElementById("generatorForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("clientName").value;
  const category = document.getElementById("projectCategory").value;
  const wood = document.getElementById("woodType").value;
  const desc = document.getElementById("projectDesc").value;
  const file = document.getElementById("projectImage").files[0];

  let imageUrl = "";
  if (file) {
    const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  // ✅ Save order to Firestore
  try {
    await addDoc(collection(db, "orders"), {
      name,
      category,
      wood,
      desc,
      imageUrl,
      status: "Pending",
      createdAt: serverTimestamp()
    });
    console.log("Order saved to Firestore ✅");
  } catch (err) {
    console.error("Error saving order:", err);
  }

  // 💬 WhatsApp Message
  let message = `Hello DwarCrafts,%0A%0AName: ${name}%0AProject: ${category}%0AMaterial: ${wood}%0ADescription: ${desc}`;
  if (imageUrl) {
    message += `%0AImage: ${imageUrl}`;
  }

  const whatsappURL = `https://wa.me/254111506427?text=${message}`;
  window.open(whatsappURL, "_blank");
});

// 📸 Preview Image
document.getElementById("projectImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = document.getElementById("previewImg");
      img.src = evt.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// 📲 Floating WhatsApp button
document.getElementById("whatsappBtn").addEventListener("click", () => {
  window.open("https://wa.me/254111506427", "_blank");
});
