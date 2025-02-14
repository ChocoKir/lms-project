// profile.js
import { supabase } from "./supabase.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  alert("❌ Please log in first!");
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
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("username", loggedInUser);
  if (error) {
    console.error("Error updating profile:", error);
    document.getElementById("message").innerText = "❌ Failed to update profile!";
  } else {
    document.getElementById("message").innerText = "✅ Profile updated successfully!";
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
