document.addEventListener("DOMContentLoaded", () => {
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
});
