document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".scroll-to-top");

    if (!button) {
        return;
    }

    const threshold = 300;

    const updateVisibility = () => {
        const shouldShow = window.scrollY > threshold;
        button.classList.toggle("is-visible", shouldShow);
        button.setAttribute("aria-hidden", String(!shouldShow));
    };

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
});
