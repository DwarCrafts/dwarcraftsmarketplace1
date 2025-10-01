<!-- firebase-config.js -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBrXBSKR63mDmDIjA18LntVfvEQmZAdcsA",
    authDomain: "dwarcrafts-marketplace.firebaseapp.com",
    projectId: "dwarcrafts-marketplace",
    storageBucket: "dwarcrafts-marketplace.appspot.com",
    messagingSenderId: "251525912015",
    appId: "1:251525912015:web:5f19e3963c4254e48beeba",
    measurementId: "G-C3L7WQE92C"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // Attach to window so other scripts can use it
  window.firebaseApp = app;
  window.firebaseDB = db;
  window.firebaseStorage = storage;

  console.log("✅ Firebase initialized on GitHub Pages");
</script>
