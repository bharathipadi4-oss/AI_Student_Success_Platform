
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");
const chatMessages = document.getElementById("chat-messages");

async function sendMessage() {
  const message = messageInput?.value.trim();
  if (!message || !chatMessages) return;

  chatMessages.insertAdjacentHTML(
    "beforeend",
    `<p><strong>You:</strong> ${escapeHTML(message)}</p>`
  );
  messageInput.value = "";
  sendButton.disabled = true;

  try {
    const response = await fetch("http://127.0.0.1:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");

    chatMessages.insertAdjacentHTML(
      "beforeend",
      `<p><strong>Campus Pulse AI:</strong> ${escapeHTML(data.reply)}</p>`
    );
  } catch (error) {
    chatMessages.insertAdjacentHTML(
      "beforeend",
      "<p>Cannot connect to the server. Check whether Flask is running.</p>"
    );
    console.error(error);
  } finally {
    sendButton.disabled = false;
  }
}

function escapeHTML(text) {
  const element = document.createElement("span");
  element.textContent = text;
  return element.innerHTML;
}

sendButton?.addEventListener("click", sendMessage);

messageInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});