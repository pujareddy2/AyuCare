const ayMotionPresets = {
  soft: {
    deviceTiltY: 10,
    deviceTiltX: 8,
    cardTilt: 6,
    depthY: 24,
    rotateX: 10,
    rotateZ: 3,
    scaleBoost: 0.02,
    blur: 0.7,
    saturationBase: 0.95,
    saturationBoost: 0.12,
    focusThreshold: 0.76,
    cutThreshold: 0.62,
    flashDuration: 210
  },
  cinematic: {
    deviceTiltY: 14,
    deviceTiltX: 12,
    cardTilt: 9,
    depthY: 42,
    rotateX: 18,
    rotateZ: 6,
    scaleBoost: 0.045,
    blur: 1.35,
    saturationBase: 0.92,
    saturationBoost: 0.25,
    focusThreshold: 0.72,
    cutThreshold: 0.56,
    flashDuration: 280
  },
  extreme: {
    deviceTiltY: 19,
    deviceTiltX: 16,
    cardTilt: 12,
    depthY: 64,
    rotateX: 26,
    rotateZ: 9,
    scaleBoost: 0.07,
    blur: 2,
    saturationBase: 0.9,
    saturationBoost: 0.35,
    focusThreshold: 0.66,
    cutThreshold: 0.48,
    flashDuration: 360
  }
};

function resolveInitialMotionPreset() {
  const bodyPreset = document.body.dataset.motionPreset;
  if (bodyPreset && ayMotionPresets[bodyPreset]) {
    return bodyPreset;
  }

  const searchParam = new URLSearchParams(window.location.search).get("motion");
  if (searchParam && ayMotionPresets[searchParam]) {
    return searchParam;
  }

  try {
    const saved = window.localStorage.getItem("ay-motion-preset");
    if (saved && ayMotionPresets[saved]) {
      return saved;
    }
  } catch (error) {
    // Ignore storage access issues.
  }

  return "cinematic";
}

function setMotionPreset(name) {
  const presetName = ayMotionPresets[name] ? name : "cinematic";
  document.body.dataset.motionPreset = presetName;

  try {
    window.localStorage.setItem("ay-motion-preset", presetName);
  } catch (error) {
    // Ignore storage access issues.
  }

  return presetName;
}

document.addEventListener("DOMContentLoaded", () => {
  let activePresetName = setMotionPreset(resolveInitialMotionPreset());
  let activePreset = ayMotionPresets[activePresetName];
  let requestRollFrame = () => {};

  window.setAyuMotionPreset = (name) => {
    activePresetName = setMotionPreset(name);
    activePreset = ayMotionPresets[activePresetName];
    requestRollFrame();
    return activePresetName;
  };

  const revealItems = document.querySelectorAll(".ay-reveal");
  if (revealItems.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  const nav = document.querySelectorAll(".ay-nav a");
  const page = window.location.pathname.split("/").pop() || "index.html";
  nav.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === page) {
      link.classList.add("active");
    }
  });

  const deviceScenes = document.querySelectorAll(".ay-device-scene");
  deviceScenes.forEach((scene) => {
    const shell = scene.querySelector(".ay-device-shell");
    if (!shell) {
      return;
    }

    const updateTilt = (clientX, clientY) => {
      const rect = scene.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      const y = (px - 0.5) * activePreset.deviceTiltY;
      const x = (0.5 - py) * activePreset.deviceTiltX;
      shell.style.transform = `rotateX(${10 + x}deg) rotateY(${y}deg) translateY(-2px)`;
    };

    scene.addEventListener("mousemove", (event) => {
      updateTilt(event.clientX, event.clientY);
    });

    scene.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];
      if (touch) {
        updateTilt(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    const reset = () => {
      shell.style.transform = "";
    };
    scene.addEventListener("mouseleave", reset);
    scene.addEventListener("touchend", reset);
  });

  document.addEventListener("mousemove", (event) => {
    const card = event.target.closest(".ay-interact");
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * activePreset.cardTilt;
    const rotateX = (0.5 - (y / rect.height)) * activePreset.cardTilt;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  document.addEventListener("mouseout", (event) => {
    const card = event.target.closest(".ay-interact");
    if (!card) {
      return;
    }

    if (!card.contains(event.relatedTarget)) {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
    }
  });

  const cameraLayers = Array.from(document.querySelectorAll(".ay-camera-layer"));
  if (cameraLayers.length > 0) {
    let rafId = null;
    let activeLayer = null;
    let cutFlashTimer = null;

    const triggerSceneCut = (layer) => {
      if (!layer) {
        return;
      }

      layer.classList.remove("ay-snap-in");
      // Restart animation cleanly on repeated focus changes.
      void layer.offsetWidth;
      layer.classList.add("ay-snap-in");

      document.body.classList.add("ay-cut-flash");
      if (cutFlashTimer) {
        window.clearTimeout(cutFlashTimer);
      }
      cutFlashTimer = window.setTimeout(() => {
        document.body.classList.remove("ay-cut-flash");
      }, activePreset.flashDuration);
    };

    const animateCameraRoll = () => {
      const viewportH = window.innerHeight || 1;
      const viewportMid = viewportH * 0.5;
      let bestLayer = null;
      let bestVisibility = -1;

      cameraLayers.forEach((layer) => {
        const rect = layer.getBoundingClientRect();
        const elementMid = rect.top + rect.height * 0.5;
        const offset = (elementMid - viewportMid) / viewportH;
        const clamped = Math.max(-1, Math.min(1, offset));
        const visibility = Math.max(0, Math.min(1, 1 - Math.abs(clamped) * 1.2));

        const depthY = -clamped * activePreset.depthY;
        const rotateX = -clamped * activePreset.rotateX;
        const rotateZ = -clamped * activePreset.rotateZ;
        const scale = 1 + visibility * activePreset.scaleBoost;
        const blur = (1 - visibility) * activePreset.blur;

        layer.style.transform = `perspective(1300px) translate3d(0, ${depthY}px, 0) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
        layer.style.filter = `blur(${blur}px) saturate(${activePreset.saturationBase + visibility * activePreset.saturationBoost})`;

        if (visibility > activePreset.focusThreshold) {
          layer.classList.add("is-focus");
        } else {
          layer.classList.remove("is-focus");
        }

        if (Math.abs(clamped) < 0.98) {
          layer.classList.add("is-rolling");
        } else {
          layer.classList.remove("is-rolling");
        }

        if (visibility > bestVisibility) {
          bestVisibility = visibility;
          bestLayer = layer;
        }
      });

      if (bestLayer && bestLayer !== activeLayer && bestVisibility > activePreset.cutThreshold) {
        activeLayer = bestLayer;
        triggerSceneCut(bestLayer);
      }

      rafId = null;
    };

    requestRollFrame = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(animateCameraRoll);
      }
    };

    requestRollFrame();
    window.addEventListener("scroll", requestRollFrame, { passive: true });
    window.addEventListener("resize", requestRollFrame);
  }
});
