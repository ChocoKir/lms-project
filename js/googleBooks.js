// js/googleBooks.js
export async function fetchGoogleBookDetails(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch Google Books data");
    }
    const data = await response.json();
    // Return the volumeInfo of the first result if available
    return data.items ? data.items[0].volumeInfo : null;
  } catch (err) {
    console.error("Google Books API error:", err);
    return null;
  }
}
