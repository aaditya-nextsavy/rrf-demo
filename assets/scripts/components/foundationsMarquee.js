
const foundationMarquee = document.querySelector(
    ".foundation-hero-marquee-track"
);

foundationMarquee.addEventListener("mouseenter", () => {
    foundationMarquee.style.animationPlayState = "running";
});

foundationMarquee.addEventListener("mouseleave", () => {
    foundationMarquee.style.animationPlayState = "running";
});