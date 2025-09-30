import { app } from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth(app);

// List of admin emails allowed
const adminEmails = [
  "dwarcraftsllc@gmail.com",
  "johnharmstoneotieno@gmail.com"
];

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (adminEmails.includes(user.email)) {
      alert("✅ Login successful!");
      window.location.href = "admin.html"; // redirect to admin panel
    } else {
      alert("⛔ Access denied: Not an admin!");
    }

  } catch (error) {
    alert("❌ Login failed: " + error.message);
  }
});
