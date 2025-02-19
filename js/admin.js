// js/admin.js
import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  showToast("Please log in first!");
  window.location.href = "index.html";
}

async function checkAdmin() {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("username", loggedInUser)
    .single();
  if (error || !data || data.role !== "admin") {
    showToast("Access Denied! Only admins can access this page.");
    window.location.href = "home.html";
  }
}
checkAdmin();

// Load Analytics
async function loadAnalytics() {
  const { count: totalBooks, error: bookError } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true });
  const { count: totalBorrowed, error: borrowError } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .neq("borrowed_by", null);
  if (!bookError && !borrowError) {
    document.getElementById("analytics").innerHTML = `
      <p>Total Books: ${totalBooks}</p>
      <p>Borrowed Books: ${totalBorrowed}</p>
    `;
  } else {
    document.getElementById("analytics").innerHTML = "<p>Error loading analytics.</p>";
  }
}
loadAnalytics();

document.getElementById("add-book-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("book-name").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const image = document.getElementById("book-image").value.trim() || null;
  if (!name || !author) {
    document.getElementById("message").innerText = "❌ Fill all required fields!";
    return;
  }
  const { error } = await supabase.from("books").insert([
    { name, author, image_url: image, borrowed_by: null, borrowed_at: null }
  ]);
  if (error) {
    console.error("Error adding book:", error);
    document.getElementById("message").innerText = "❌ Failed to add book!";
    showToast("Failed to add book: " + error.message);
  } else {
    document.getElementById("message").innerText = "✅ Book added successfully!";
    showToast("Book added successfully!");
    document.getElementById("add-book-form").reset();
    loadAnalytics();
  }
});

document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
