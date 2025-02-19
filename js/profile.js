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

document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newNickname = document.getElementById("new-nickname").value.trim();
  const newProfilePic = document.getElementById("new-profile-pic").value.trim();
  const updates = {};
  if (newNickname) updates.nickname = newNickname;
  if (newProfilePic) updates.profile_pic = newProfilePic;
  if (Object.keys(updates).length === 0) {
    document.getElementById("message").innerText = "❌ No changes made!";
    return;
  }
  const { error } = await supabase.from("users").update(updates).eq("username", loggedInUser);
  if (error) {
    console.error("Error updating profile:", error);
    document.getElementById("message").innerText = "❌ Failed to update profile!";
    showToast("Profile update failed: " + error.message);
  } else {
    document.getElementById("message").innerText = "✅ Profile updated successfully!";
    showToast("Profile updated successfully!");
    loadProfile();
  }
});

// Avatar upload: Clicking profile picture triggers file input.
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

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});

loadProfile();
