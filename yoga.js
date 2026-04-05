const videos = [
  {
    title: "Morning Energy Yoga",
    time: "morning",
    mood: "tired",
    goal: "energy",
    url: "https://www.youtube.com/embed/VaoV1PrYft4"
  },
  {
    title: "Back Pain Relief Yoga",
    time: "evening",
    mood: "okay",
    goal: "pain",
    url: "https://www.youtube.com/embed/sTANio_2E0Q"
  },
  {
    title: "Stress Relief Yoga",
    time: "afternoon",
    mood: "stressed",
    goal: "relief",
    url: "https://www.youtube.com/embed/4pLUleLdwY4"
  },
  {
    title: "Focus Flow Yoga",
    time: "morning",
    mood: "okay",
    goal: "focus",
    url: "https://www.youtube.com/embed/iu2WMtQZGQA"
  },
  {
    title: "Yoga for Digestion",
    time: "evening",
    mood: "tired",
    goal: "digestion",
    url: "https://www.youtube.com/embed/oMgT_fN3F20"
  },
  {
    title: "Bedtime Yoga for Sleep",
    time: "evening",
    mood: "stressed",
    goal: "sleep",
    url: "https://www.youtube.com/embed/EZkR3p6f2xg"
  },
  {
    title: "Full Body Flow (Anytime)",
    time: "any",
    mood: "okay",
    goal: "energy",
    url: "https://www.youtube.com/embed/OQ6NfFIr2jw"
  }
];

function renderVideos(list) {
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";

  list.forEach((video) => {
    const card = document.createElement("div");
    card.className = "ay-card";
    card.innerHTML = `
      <h2 style="margin:0 0 0.55rem;font-size:1rem;font-weight:700;">${video.title}</h2>
      <iframe style="width:100%;height:230px;border:0;border-radius:0.8rem;" src="${video.url}" allowfullscreen></iframe>
    `;
    container.appendChild(card);
  });
}

document.getElementById("recommendationForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const time = document.getElementById("timeOfDay").value;
  const mood = document.getElementById("mood").value;
  const goal = document.getElementById("goal").value;

  const matched = videos.filter((video) => {
    return (video.time === time || video.time === "any") && video.mood === mood && video.goal === goal;
  });

  const result = document.getElementById("recommendationResult");
  if (matched.length > 0) {
    result.textContent = "Showing recommended videos for your selection:";
    renderVideos(matched);
  } else {
    result.textContent = "No matching videos found. Try different filters.";
    renderVideos(videos);
  }
});

renderVideos(videos);
