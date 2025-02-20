// js/home.js
import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";
import { fetchGoogleBookDetails } from "./googleBooks.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  showToast("Please log in first!");
  window.location.href = "index.html";
}

let currentPage = 0;
const pageSize = 5;
let allBooks = [];

// Load all book names for search suggestions
async function loadAllBooks() {
  const { data, error } = await supabase.from("books").select("name");
  if (!error && data) {
    allBooks = data.map(b => b.name);
  }
}
loadAllBooks();

// Helper: Check if a book is favorited
async function isFavorite(bookId) {
  const { data } = await supabase
    .from("favorites")
    .select("*")
    .eq("username", loggedInUser)
    .eq("book_id", bookId);
  return data && data.length > 0;
}

// Toggle Favorite: updates the star icon on the button
async function toggleFavorite(bookId, btnElement) {
  const favExists = await isFavorite(bookId);
  if (favExists) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("book_id", bookId)
      .eq("username", loggedInUser);
    if (error) {
      showToast("Failed to remove favorite: " + error.message);
      return;
    }
    btnElement.innerText = "☆"; // outline star
    showToast("Removed from favorites!");
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert([{ username: loggedInUser, book_id: bookId }]);
    if (error) {
      showToast("Failed to add favorite: " + error.message);
      return;
    }
    btnElement.innerText = "★"; // filled star
    showToast("Added to favorites!");
  }
  reloadBooks();
}

// Fetch Books with filtering, sorting, and pagination
async function fetchBooks(titleQuery = "", authorQuery = "", sortBy = "name", page = 0) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data: books, error } = await supabase
    .from("books")
    .select("*")
    .ilike("name", `%${titleQuery}%`)
    .ilike("author", `%${authorQuery}%`)
    .order(sortBy, { ascending: true })
    .range(from, to);
  
  const bookList = document.getElementById("book-list");
  if (page === 0) bookList.innerHTML = "";
  if (error) {
    bookList.innerHTML += "<p>Error fetching books.</p>";
    return;
  }
  if (!books || books.length === 0) {
    if (page === 0) bookList.innerHTML = "<p>No books found.</p>";
    return;
  }
  
  books.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item");
    bookItem.innerHTML = `
      <h3>${book.name}</h3>
      <p>Author: ${book.author}</p>
      <img src="${book.image_url || 'placeholder.jpg'}" alt="Book Cover" loading="lazy" width="100" style="cursor:pointer;" onclick="openModalWithBook('${book.id}')">
      <p>${book.borrowed_by ? `❌ Borrowed by ${book.borrowed_by}` : "✅ Available"}</p>
      ${
        book.borrowed_by === loggedInUser
          ? `<button onclick="returnBook('${book.id}')">Return</button>`
          : (!book.borrowed_by ? `<button onclick="borrowBook('${book.id}')">Borrow</button>` : "")
      }
    `;
    // Favorite button
    const favBtn = document.createElement("button");
    favBtn.innerText = "☆";
    favBtn.onclick = async () => { await toggleFavorite(book.id, favBtn); };
    bookItem.appendChild(favBtn);
    // Reservation button
    if (book.borrowed_by && !book.reserved_by) {
      const reserveBtn = document.createElement("button");
      reserveBtn.innerText = "Reserve";
      reserveBtn.onclick = () => reserveBook(book.id);
      bookItem.appendChild(reserveBtn);
    } else if (book.reserved_by) {
      const reservedText = document.createElement("p");
      reservedText.innerText = `Reserved by ${book.reserved_by}`;
      bookItem.appendChild(reservedText);
    }
    // Reviews Section and Form (header is set dynamically)
    const reviewSection = document.createElement("div");
    reviewSection.innerHTML = `
      <div id="reviews-${book.id}"></div>
      <form onsubmit="submitReview(event, '${book.id}')">
        <div>
          <span id="stars-${book.id}"></span>
          <input type="number" min="1" max="5" placeholder="Rating (1-5)" required style="display:none;">
        </div>
        <textarea placeholder="Write a review..." required></textarea>
        <button type="submit">Submit Review</button>
      </form>
    `;
    bookItem.appendChild(reviewSection);
    bookList.appendChild(bookItem);
    loadStars(book.id);
    loadReviews(book.id);
  });
}

// Borrow Book: Updates both books and borrowed_books table
async function borrowBook(bookId) {
  const { error: updateError } = await supabase
    .from("books")
    .update({ borrowed_by: loggedInUser, borrowed_at: new Date() })
    .eq("id", bookId);
  if (updateError) {
    showToast("Failed to borrow: " + updateError.message);
    return;
  }
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("username", loggedInUser)
    .single();
  if (userError || !userData) {
    showToast("Failed to get user info: " + (userError ? userError.message : "User not found"));
    return;
  }
  const userId = userData.id;
  const { error: insertError } = await supabase
    .from("borrowed_books")
    .insert([{ user_id: userId, book_id: bookId, borrowed_at: new Date(), returned: false }]);
  if (insertError) {
    showToast("Failed to record borrowing: " + insertError.message);
  } else {
    showToast("Book borrowed successfully!");
    reloadBooks();
  }
}

// Return Book: Updates both books and borrowed_books table
async function returnBook(bookId) {
  const { error: updateError } = await supabase
    .from("books")
    .update({ borrowed_by: null, borrowed_at: null })
    .eq("id", bookId);
  if (updateError) {
    showToast("Failed to return: " + updateError.message);
    return;
  }
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("username", loggedInUser)
    .single();
  if (userError || !userData) {
    showToast("Failed to get user info: " + (userError ? userError.message : "User not found"));
    return;
  }
  const userId = userData.id;
  const { error: updateBorrowError } = await supabase
    .from("borrowed_books")
    .update({ returned: true })
    .eq("book_id", bookId)
    .eq("user_id", userId);
  if (updateBorrowError) {
    showToast("Failed to update borrowing history: " + updateBorrowError.message);
  } else {
    showToast("Book returned successfully!");
    reloadBooks();
  }
}

// Reserve Book
async function reserveBook(bookId) {
  const { error } = await supabase
    .from("books")
    .update({ reserved_by: loggedInUser })
    .eq("id", bookId);
  if (error) showToast("Failed to reserve: " + error.message);
  else { showToast("Book reserved!"); reloadBooks(); }
}

// Submit Review
async function submitReview(e, bookId) {
  e.preventDefault();
  const form = e.target;
  const rating = parseInt(form.querySelector('input[type="number"]').value);
  const reviewText = form.querySelector('textarea').value;
  const { error } = await supabase
    .from("reviews")
    .insert([{ book_id: bookId, username: loggedInUser, rating, review_text: reviewText }]);
  if (error) showToast("Review error: " + error.message);
  else { showToast("Review submitted!"); loadReviews(bookId); form.reset(); loadStars(bookId); }
}

// Load Reviews
async function loadReviews(bookId) {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  const container = document.getElementById(`reviews-${bookId}`);
  container.innerHTML = "<h4>Reviews:</h4>";
  if (error) {
    container.innerHTML += "<p>Error loading reviews.</p>";
    return;
  }
  reviews.forEach((rev) => {
    const revDiv = document.createElement("div");
    revDiv.classList.add("review");
    revDiv.innerHTML = `<strong>${rev.username}</strong> rated: ${rev.rating}/5<br>${rev.review_text}`;
    container.appendChild(revDiv);
  });
}

// Load Stars for Review Form
function loadStars(bookId) {
  const starContainer = document.getElementById(`stars-${bookId}`);
  if (!starContainer) return;
  let starsHTML = "";
  for (let i = 1; i <= 5; i++) {
    starsHTML += `<span class="star" onclick="setReviewRating(event, ${i}, '${bookId}')">&#9733;</span>`;
  }
  starContainer.innerHTML = starsHTML;
}

window.setReviewRating = function(event, rating, bookId) {
  const form = event.target.closest("form");
  form.querySelector('input[type="number"]').value = rating;
  const stars = form.querySelectorAll(".star");
  stars.forEach((star, index) => {
    star.style.color = index < rating ? "#f1c40f" : "#ccc";
  });
};

// Modal functions: Fetch extra details from Google Books API too
window.openModalWithBook = async function(bookId) {
  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .single();
  if (error || !book) { showToast("Error loading book details."); return; }
  let modalHTML = `
    <h2>${book.name}</h2>
    <p><strong>Author:</strong> ${book.author}</p>
    <img src="${book.image_url || 'placeholder.jpg'}" alt="Book Cover" loading="lazy" width="150">
    <p>${book.borrowed_by ? `Borrowed by ${book.borrowed_by}` : "Available"}</p>
    <button id="extra-details-btn">View Extra Details</button>
    <div id="extra-details"></div>
  `;
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  modalHTML += "<h3>Reviews:</h3>";
  if (reviews && reviews.length > 0) {
    reviews.forEach((rev) => {
      modalHTML += `<div class="review"><strong>${rev.username}</strong> rated: ${rev.rating}/5<br>${rev.review_text}</div>`;
    });
  } else { modalHTML += "<p>No reviews yet.</p>"; }
  openModal(modalHTML);
  
  // Add event listener for extra details
  document.getElementById("extra-details-btn").addEventListener("click", async () => {
    const extraDetails = await fetchGoogleBookDetails(book.name);
    if (extraDetails) {
      document.getElementById("extra-details").innerHTML = `
        <p><strong>Description:</strong> ${extraDetails.description || "N/A"}</p>
        <p><strong>Page Count:</strong> ${extraDetails.pageCount || "N/A"}</p>
        <p><strong>Publisher:</strong> ${extraDetails.publisher || "N/A"}</p>
      `;
    } else {
      document.getElementById("extra-details").innerText = "No extra details found.";
    }
  });
};

window.openModal = function(contentHTML) {
  const overlay = document.getElementById("modal-overlay");
  document.getElementById("modal-body").innerHTML = contentHTML;
  overlay.style.display = "flex";
};

window.closeModal = function() {
  document.getElementById("modal-overlay").style.display = "none";
};

// Infinite Scroll
window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    currentPage++;
    const titleQuery = document.getElementById("search").value.trim();
    const authorQuery = document.getElementById("search-author").value.trim();
    fetchBooks(titleQuery, authorQuery, document.getElementById("sort-by")?.value || "name", currentPage);
  }
});

function reloadBooks() {
  currentPage = 0;
  const titleQuery = document.getElementById("search").value.trim();
  const authorQuery = document.getElementById("search-author").value.trim();
  fetchBooks(titleQuery, authorQuery, document.getElementById("sort-by")?.value || "name", currentPage);
}

// Search Suggestions (Autocomplete)
document.getElementById("search").addEventListener("input", (e) => {
  const input = e.target.value.toLowerCase();
  const suggestions = allBooks.filter(name => name.toLowerCase().includes(input));
  let suggestionBox = document.getElementById("suggestions");
  if (!suggestionBox) {
    suggestionBox = document.createElement("div");
    suggestionBox.id = "suggestions";
    suggestionBox.style.border = "1px solid #ccc";
    suggestionBox.style.background = "#fff";
    suggestionBox.style.position = "absolute";
    suggestionBox.style.width = "calc(40% - 20px)";
    e.target.parentNode.appendChild(suggestionBox);
  }
  suggestionBox.innerHTML = "";
  suggestions.forEach(sugg => {
    const div = document.createElement("div");
    div.innerText = sugg;
    div.style.padding = "0.5rem";
    div.style.cursor = "pointer";
    div.addEventListener("click", () => {
      document.getElementById("search").value = sugg;
      suggestionBox.innerHTML = "";
    });
    suggestionBox.appendChild(div);
  });
});

// Real-time updates via Supabase channel
const channel = supabase
  .channel('books-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, payload => {
    reloadBooks();
  })
  .subscribe();

// Navigation
document.getElementById("profile-btn").addEventListener("click", () => {
  window.location.href = "profile.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
document.getElementById("search-btn").addEventListener("click", () => {
  currentPage = 0;
  const titleQuery = document.getElementById("search").value.trim();
  const authorQuery = document.getElementById("search-author").value.trim();
  fetchBooks(titleQuery, authorQuery, document.getElementById("sort-by")?.value || "name", currentPage);
});
document.getElementById("search").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    currentPage = 0;
    const titleQuery = document.getElementById("search").value.trim();
    const authorQuery = document.getElementById("search-author").value.trim();
    fetchBooks(titleQuery, authorQuery, document.getElementById("sort-by")?.value || "name", currentPage);
  }
});

fetchBooks();
checkAdmin();
async function checkAdmin() {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("username", loggedInUser)
    .single();
  if (!error && data && data.role === "admin") {
    const adminBtn = document.getElementById("admin-btn");
    adminBtn.style.display = "block";
    adminBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  }
}

window.borrowBook = borrowBook;
window.returnBook = returnBook;
window.submitReview = submitReview;
window.openModalWithBook = openModalWithBook;
