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

// Load analytics data and render Chart.js chart
async function loadAnalyticsData() {
  const { count: totalBooks } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true });
  const { count: totalBorrowed } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .neq("borrowed_by", null);
  const { count: totalReserved } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .not("reserved_by", "is", null);
  return { totalBooks, totalBorrowed, totalReserved };
}

async function renderChart() {
  const { totalBooks, totalBorrowed, totalReserved } = await loadAnalyticsData();
  const ctx = document.getElementById("analyticsChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Books', 'Borrowed', 'Reserved'],
      datasets: [{
        label: 'Library Analytics',
        data: [totalBooks, totalBorrowed, totalReserved],
        backgroundColor: ['#3498db', '#e74c3c', '#9b59b6'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}
renderChart();

document.getElementById("add-book-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("book-name").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const image = document.getElementById("book-image").value.trim() || null;
  if (!name || !author) {
    document.getElementById("message").innerText = "Fill all required fields!";
    return;
  }
  const { error } = await supabase.from("books").insert([
    { name, author, image_url: image, borrowed_by: null, borrowed_at: null }
  ]);
  if (error) {
    document.getElementById("message").innerText = "Failed to add book!";
    showToast("Error: " + error.message);
  } else {
    document.getElementById("message").innerText = "Book added successfully!";
    showToast("Book added successfully!");
    document.getElementById("add-book-form").reset();
    renderChart();
  }
});

document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
