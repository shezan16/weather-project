function shouldUseReducedEffects() {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const lowMemoryDevice = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 2;
    const lowCoreDevice = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2;

    return Boolean(prefersReducedMotion || lowMemoryDevice || lowCoreDevice);
}

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

function setupNavigationUi() {
    const nav = document.querySelector("nav");

    if (!nav) {
        return;
    }

    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    nav.querySelectorAll(".nav-link[href]").forEach((link) => {
        const href = (link.getAttribute("href") || "").split("?")[0].toLowerCase();

        if (href && href === currentPage) {
            link.classList.add("active");
        }
    });

    const teamIcon = nav.querySelector(".team-icon[href]");

    if (teamIcon && currentPage === "team.html") {
        teamIcon.classList.add("active");
    }
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
    if (window.weatherUiPrefs?.reducedEffects || window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    const spotlightTargets = document.querySelectorAll(
        ".hero-card, .container, .map-page-card, .site-footer, .member, .analytics-card, .overview-card"
    );

    spotlightTargets.forEach((target) => {
        target.classList.add("spotlight-shell");
        let frameId = null;

        target.addEventListener("pointermove", (event) => {
            if (frameId) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {
                const rect = target.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                target.style.setProperty("--spot-x", `${x}%`);
                target.style.setProperty("--spot-y", `${y}%`);
                frameId = null;
            });
        });

        target.addEventListener("pointerleave", () => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
                frameId = null;
            }
            target.style.setProperty("--spot-x", "50%");
            target.style.setProperty("--spot-y", "50%");
        });
    });
}

function setupSceneMotion() {
    if (window.weatherUiPrefs?.reducedEffects || window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    let frameId = null;

    document.addEventListener("pointermove", (event) => {
        if (frameId) {
            return;
        }

        frameId = window.requestAnimationFrame(() => {
            const x = (event.clientX / window.innerWidth) * 100;
            const y = (event.clientY / window.innerHeight) * 100;
            document.body.style.setProperty("--scene-x", `${x}%`);
            document.body.style.setProperty("--scene-y", `${y}%`);
            frameId = null;
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const reducedEffects = shouldUseReducedEffects();
    window.weatherUiPrefs = { reducedEffects };
    document.body.classList.toggle("reduced-effects", reducedEffects);

    setupNavigationUi();
    updateFooterClocks();
    setupRevealAnimations();
    setupSpotlightMotion();
    setupSceneMotion();
    window.setInterval(updateFooterClocks, 1000 * 30);
});
