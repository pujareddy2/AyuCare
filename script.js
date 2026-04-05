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

function setupScannerDeviceMotion() {
  const device = document.getElementById("scannerDevice");
  if (!device) {
    return;
  }

  const interactiveTilt = (x, y, rect) => {
    const px = (x - rect.left) / rect.width;
    const py = (y - rect.top) / rect.height;
    const tiltY = (px - 0.5) * 16;
    const tiltX = (0.5 - py) * 14;
    device.style.transform = `rotateX(${10 + tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
  };

  device.addEventListener("mousemove", (event) => {
    const rect = device.getBoundingClientRect();
    interactiveTilt(event.clientX, event.clientY, rect);
  });

  device.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const rect = device.getBoundingClientRect();
    interactiveTilt(touch.clientX, touch.clientY, rect);
  }, { passive: true });

  const reset = () => {
    device.style.transform = "";
  };

  device.addEventListener("mouseleave", reset);
  device.addEventListener("touchend", reset);
}

function setupModuleParallax() {
  const modules = document.querySelectorAll(".module");
  modules.forEach((moduleCard) => {
    moduleCard.addEventListener("mousemove", (e) => {
      const rect = moduleCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = (0.5 - (y / rect.height)) * 8;
      moduleCard.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    moduleCard.addEventListener("mouseleave", () => {
      moduleCard.style.transform = "translateY(0)";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupCarousel3D();
  setupRevealAnimations();
  setupTiltCards();
  setupScannerDeviceMotion();
  setupModuleParallax();
});
