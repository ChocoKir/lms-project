// js/profile.js
import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  showToast("Please log in first!");
  window.location.href = "index.html";
}

document.getElementById("username").innerText = loggedInUser;

async function loadProfile() {
  const { data, error } = await supabase
    .from("users")
    .select("nickname, profile_pic")
    .eq("username", loggedInUser)
    .single();
  if (error) {
    console.error("Error loading profile:", error);
    return;
  }
  document.getElementById("nickname").innerText = data.nickname || "No nickname set";
  document.getElementById("profile-pic").src = data.profile_pic || "default-profile.jpg";
}
loadProfile();

document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newNickname = document.getElementById("new-nickname").value.trim();
  const newProfilePic = document.getElementById("new-profile-pic").value.trim();
  const updates = {};
  if (newNickname) updates.nickname = newNickname;
  if (newProfilePic) updates.profile_pic = newProfilePic;
  if (Object.keys(updates).length === 0) {
    document.getElementById("message").innerText = "No changes made!";
    return;
  }
  const { error } = await supabase.from("users").update(updates).eq("username", loggedInUser);
  if (error) {
    document.getElementById("message").innerText = "Failed to update profile!";
    showToast("Profile update failed: " + error.message);
  } else {
    document.getElementById("message").innerText = "Profile updated!";
    showToast("Profile updated successfully!");
    loadProfile();
  }
});

// Avatar upload
document.getElementById("profile-pic").addEventListener("click", () => {
  document.getElementById("file-upload").click();
});
document.getElementById("file-upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const { data, error } = await supabase
    .storage
    .from("avatars")
    .upload(file.name, file);
  if (error) {
    showToast("Error uploading avatar: " + error.message);
  } else {
    const avatarUrl = data.path;
    await supabase.from("users").update({ profile_pic: avatarUrl }).eq("username", loggedInUser);
    showToast("Profile picture updated!");
    loadProfile();
  }
});

// Export Borrowing History as CSV
document.getElementById("export-btn")?.addEventListener("click", async () => {
  // Get user's UUID from custom users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("username", loggedInUser)
    .single();

  if (userError || !userData) {
    showToast("Error fetching user data: " + (userError ? userError.message : "User not found"));
    return;
  }
  
  const userId = userData.id;
  console.log("User UUID:", userId); // Debug log

  // Query borrowed_books using the user's UUID
  const { data: history, error } = await supabase
    .from("borrowed_books")
    .select("*")
    .eq("user_id", userId);

  console.log("Borrowing History:", history); // Debug log
  
  if (error) {
    showToast("Error exporting history: " + error.message);
    console.error("Export Error:", error);
    return;
  }
  
  if (!history || history.length === 0) {
    showToast("No borrowing history found!");
    return;
  }
  
  let csv = "id,book_id,borrowed_at,returned\n";
  history.forEach(item => {
    let borrowedAtVal = "";
    if (item.borrowed_at && !isNaN(new Date(item.borrowed_at).getTime())) {
      borrowedAtVal = new Date(item.borrowed_at).toISOString();
    } else {
      borrowedAtVal = item.borrowed_at ? String(item.borrowed_at) : "N/A";
    }
    csv += `${item.id},${item.book_id},${borrowedAtVal},${item.returned}\n`;
  });
  
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "borrowing_history.csv";
  a.click();
});


// Navigation
document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
