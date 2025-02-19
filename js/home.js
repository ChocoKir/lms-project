// js/home.js
import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  showToast("Please log in first!");
  window.location.href = "index.html";
}

async function fetchBooks(titleQuery = "", authorQuery = "") {
  const { data: books, error } = await supabase
    .from("books")
    .select("*")
    .ilike("name", `%${titleQuery}%`)
    .ilike("author", `%${authorQuery}%`);
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
    // Add review section
    const reviewSection = document.createElement("div");
    reviewSection.innerHTML = `
      <h4>Reviews:</h4>
      <div id="reviews-${book.id}"></div>
      <form onsubmit="submitReview(event, '${book.id}')">
        <input type="number" min="1" max="5" placeholder="Rating (1-5)" required>
        <textarea placeholder="Write a review..." required></textarea>
        <button type="submit">Submit Review</button>
      </form>
    `;
    bookItem.appendChild(reviewSection);
    loadReviews(book.id);
    bookList.appendChild(bookItem);
  });
}

async function borrowBook(bookId) {
  const { error } = await supabase
    .from("books")
    .update({ borrowed_by: loggedInUser, borrowed_at: new Date() })
    .eq("id", bookId);
  if (error) {
    console.error("Error borrowing book:", error);
    showToast("Failed to borrow book: " + error.message);
  } else {
    showToast("Book borrowed successfully!");
    const titleQuery = document.getElementById("search").value.trim();
    const authorQuery = document.getElementById("search-author").value.trim();
    fetchBooks(titleQuery, authorQuery);
  }
}

async function returnBook(bookId) {
  const { error } = await supabase
    .from("books")
    .update({ borrowed_by: null, borrowed_at: null })
    .eq("id", bookId);
  if (error) {
    console.error("Error returning book:", error);
    showToast("Failed to return book: " + error.message);
  } else {
    showToast("Book returned successfully!");
    const titleQuery = document.getElementById("search").value.trim();
    const authorQuery = document.getElementById("search-author").value.trim();
    fetchBooks(titleQuery, authorQuery);
  }
}

async function submitReview(e, bookId) {
  e.preventDefault();
  const form = e.target;
  const rating = parseInt(form.querySelector('input[type="number"]').value);
  const reviewText = form.querySelector('textarea').value;
  const { error } = await supabase
    .from("reviews")
    .insert([{ book_id: bookId, username: loggedInUser, rating, review_text: reviewText }]);
  if (error) {
    showToast("Error submitting review: " + error.message);
  } else {
    showToast("Review submitted!");
    loadReviews(bookId);
    form.reset();
  }
}

async function loadReviews(bookId) {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  const container = document.getElementById(`reviews-${bookId}`);
  container.innerHTML = "";
  if (error) {
    container.innerHTML = "<p>Error loading reviews.</p>";
    return;
  }
  reviews.forEach((rev) => {
    const revDiv = document.createElement("div");
    revDiv.classList.add("review");
    revDiv.innerHTML = `<strong>${rev.username}</strong> rated: ${rev.rating}/5<br>${rev.review_text}`;
    container.appendChild(revDiv);
  });
}

// Navigation
document.getElementById("profile-btn").addEventListener("click", () => {
  window.location.href = "profile.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// Admin check
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
  const titleQuery = document.getElementById("search").value.trim();
  const authorQuery = document.getElementById("search-author").value.trim();
  fetchBooks(titleQuery, authorQuery);
});

document.getElementById("search").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const titleQuery = document.getElementById("search").value.trim();
    const authorQuery = document.getElementById("search-author").value.trim();
    fetchBooks(titleQuery, authorQuery);
  }
});

fetchBooks();
checkAdmin();

window.borrowBook = borrowBook;
window.returnBook = returnBook;
window.submitReview = submitReview;
