function updateFooterClocks() {
    const targets = document.querySelectorAll(".footer-clock-value");

    if (!targets.length) {
        return;
    }

    const now = new Date();
    const value = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    targets.forEach((target) => {
        target.textContent = value;
    });
}

function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll("[data-reveal]");

    if (!revealTargets.length) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealTargets.forEach((target) => observer.observe(target));
}

function setupSpotlightMotion() {
    const spotlightTargets = document.querySelectorAll(
        ".hero-card, .container, .map-page-card, .site-footer, .member, .analytics-card, .overview-card"
    );

    spotlightTargets.forEach((target) => {
        target.classList.add("spotlight-shell");

        target.addEventListener("pointermove", (event) => {
            const rect = target.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            target.style.setProperty("--spot-x", `${x}%`);
            target.style.setProperty("--spot-y", `${y}%`);
        });

        target.addEventListener("pointerleave", () => {
            target.style.setProperty("--spot-x", "50%");
            target.style.setProperty("--spot-y", "50%");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateFooterClocks();
    setupRevealAnimations();
    setupSpotlightMotion();
    window.setInterval(updateFooterClocks, 1000 * 30);
});
