let model;
let webcam;
let maxPredictions;
let scannerStarted = false;

async function init() {
  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/DO477GJ3YJ/"; // Replace!
  if (scannerStarted) {
    return;
  }

  // Load the model
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup webcam
    const flip = true;
    webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
    await webcam.setup(); // Ask for camera permission
    await webcam.play();
    scannerStarted = true;
    window.requestAnimationFrame(loop);

    document.getElementById("webcam").srcObject = webcam.webcam;
  } catch (error) {
    console.error("Failed to load model or webcam", error);
    document.getElementById("result").innerHTML = "Error loading model/webcam.";
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  if (!model || !webcam) {
    return;
  }

  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  document.getElementById("result").innerHTML = `🌿 Detected: ${prediction[0].className} (${(prediction[0].probability * 100).toFixed(2)}%)`;
}

function setupCarousel3D() {
  const track = document.getElementById("carouselTrack");
  if (!track) {
    return;
  }

  const panels = Array.from(track.children);
  const angleStep = 360 / panels.length;
  const radius = window.innerWidth < 640 ? 230 : 290;

  panels.forEach((panel, index) => {
    panel.style.transform = `rotateY(${index * angleStep}deg) translateZ(${radius}px)`;
  });

  let angle = 0;
  const spin = () => {
    angle += 0.23;
    track.style.transform = `rotateX(-8deg) rotateY(${angle}deg)`;
    requestAnimationFrame(spin);
  };
  requestAnimationFrame(spin);
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((el) => observer.observe(el));
}

function setupTiltCards() {
  const cards = document.querySelectorAll(".tilt-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = (0.5 - (y / rect.height)) * 10;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
}

async function checkBackendHealth() {
  const statusEl = document.getElementById("apiStatus");
  if (!statusEl) {
    return;
  }

  const endpoints = [
    "/health",
    "/api/health",
    "http://localhost:5000/health",
    "http://localhost:8000/health"
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: "GET" });
      if (response.ok) {
        statusEl.textContent = `Backend connected via ${endpoint}`;
        return;
      }
    } catch (error) {
      // Try next endpoint.
    }
  }

  statusEl.textContent = "Backend endpoint not detected. Update API URL for deployment.";
}

document.addEventListener("DOMContentLoaded", () => {
  setupCarousel3D();
  setupRevealAnimations();
  setupTiltCards();
  checkBackendHealth();
});
