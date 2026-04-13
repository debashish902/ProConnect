const API = "/api";

async function register() {

  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !username || !email || !password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, username, email, password })
    });

    const data = await res.json();

    console.log(data);

    alert(data.message || "Registered Successfully");

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}


window.login = async function () {

  console.log("Login clicked");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location = "home.html";
  } else {
    alert("Login failed");
  }
};

async function createPost() {
  const content = document.getElementById("postContent").value;
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ content })
  });

  loadPosts();
}


async function loadPosts() {
  const res = await fetch(`${API}/posts`);
  const posts = await res.json();

  const container = document.getElementById("posts");
  container.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.innerHTML = `<p><b>${post.user.name}</b>: ${post.content}</p>`;
    container.appendChild(div);
  });
}


if (window.location.pathname.includes("dashboard.html")) {
  loadPosts();
}