// home.js
import { supabase } from "./supabase.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  alert("❌ Please log in first!");
  window.location.href = "index.html";
}

async function fetchBooks(query = "") {
  const { data: books, error } = await supabase
    .from("books")
    .select("*")
    .ilike("name", `%${query}%`);
  const bookList = document.getElementById("book-list");
  bookList.innerHTML = "";
  if (error) {
    console.error("Error fetching books:", error);
    bookList.innerHTML = "<p>Error fetching books.</p>";
    return;
  }
  if (!books || books.length === 0) {
    bookList.innerHTML = "<p>No books found.</p>";
    return;
  }
  books.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item");
    bookItem.innerHTML = `
      <h3>${book.name}</h3>
      <p>Author: ${book.author}</p>
      <img src="${book.image_url || 'placeholder.jpg'}" alt="Book Cover" width="100">
      <p>${book.borrowed_by ? `❌ Borrowed by ${book.borrowed_by}` : "✅ Available"}</p>
      ${
        book.borrowed_by === loggedInUser
          ? `<button onclick="returnBook('${book.id}')">Return</button>`
          : (!book.borrowed_by ? `<button onclick="borrowBook('${book.id}')">Borrow</button>` : "")
      }
    `;
    bookList.appendChild(bookItem);
  });
}

async function borrowBook(bookId) {
  if (!loggedInUser) {
    alert("Please log in first!");
    return;
  }
  const { error } = await supabase
    .from("books")
    .update({ borrowed_by: loggedInUser, borrowed_at: new Date() })
    .eq("id", bookId);
  if (error) {
    console.error("Error borrowing book:", error);
    alert("Failed to borrow book.");
  } else {
    alert("Book borrowed successfully!");
    fetchBooks();
  }
}

async function returnBook(bookId) {
  const { error } = await supabase
    .from("books")
    .update({ borrowed_by: null, borrowed_at: null })
    .eq("id", bookId);
  if (error) {
    console.error("Error returning book:", error);
    alert("Failed to return book.");
  } else {
    alert("Book returned successfully!");
    fetchBooks();
  }
}

// Navigation event listeners
document.getElementById("profile-btn").addEventListener("click", () => {
  window.location.href = "profile.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// Check if user is admin
async function checkAdmin() {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("username", loggedInUser)
    .single();
  if (error) {
    console.error("Error checking admin status:", error);
    return;
  }
  if (data.role === "admin") {
    const adminBtn = document.getElementById("admin-btn");
    adminBtn.style.display = "block";
    adminBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  }
}

document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search").value.trim();
  fetchBooks(query);
});

document.getElementById("search").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchBooks(e.target.value.trim());
  }
});

fetchBooks();
checkAdmin();

window.borrowBook = borrowBook;
window.returnBook = returnBook;
