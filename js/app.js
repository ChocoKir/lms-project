import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";

// REGISTRATION
if (document.getElementById("register-form")) {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;
    if (!username || !password) {
      document.getElementById("register-message").innerText = "Fill all fields!";
      return;
    }
    const { data, error } = await supabase.from("users").insert([{ username, password, role }]);
    if (error) {
      document.getElementById("register-message").innerText = "Registration Failed!";
      showToast("Error: " + error.message);
    } else {
      document.getElementById("register-message").innerText = "Registration Successful!";
      showToast("Registration successful!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    }
  });
}

// LOGIN
if (document.getElementById("login-btn")) {
  document.getElementById("login-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (!username || !password) {
      document.getElementById("login-message").innerText = "Fill all fields!";
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();
    if (error || !data) {
      document.getElementById("login-message").innerText = "Invalid Username or Password!";
      showToast("Login failed: " + (error ? error.message : "Invalid credentials"));
    } else {
      document.getElementById("login-message").innerText = "Login Successful!";
      localStorage.setItem("username", username);
      if (data.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "home.html";
      }
    }
  });
}
