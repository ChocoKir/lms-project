// js/chat.js
import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";

const loggedInUser = localStorage.getItem("username");
if (!loggedInUser) {
  showToast("Please log in first!");
  window.location.href = "index.html";
}

const chatContainer = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

async function loadMessages() {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    showToast("Error loading messages: " + error.message);
    return;
  }
  chatContainer.innerHTML = "";
  data.forEach(msg => {
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
    chatContainer.appendChild(msgDiv);
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
loadMessages();

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  const { error } = await supabase
    .from("chat_messages")
    .insert([{ username: loggedInUser, message }]);
  if (error) showToast("Error sending message: " + error.message);
  chatInput.value = "";
});

const chatChannel = supabase
  .channel('chat')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, payload => {
    loadMessages();
  })
  .subscribe();

document.getElementById("home-btn").addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
