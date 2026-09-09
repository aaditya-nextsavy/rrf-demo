document.addEventListener("DOMContentLoaded", () => {

    const sliders = Array.from(document.querySelectorAll("[data-event-slider]"));

    sliders.forEach((slider) => {
        const track = slider.querySelector(".event-impact-slider-track");
        const slides = Array.from(slider.querySelectorAll(".event-impact-slide"));
        const dots = Array.from(slider.querySelectorAll(".event-impact-slider-dot"));
        const prevButton = slider.querySelector(".event-impact-slider-nav.prev");
        const nextButton = slider.querySelector(".event-impact-slider-nav.next");

        if (!track || slides.length === 0) {
            return;
        }

        let activeIndex = 0;

        const goToSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${activeIndex * 100}%)`;

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };

        if (prevButton) {
            prevButton.addEventListener("click", () => goToSlide(activeIndex - 1));
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => goToSlide(activeIndex + 1));
        }

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => goToSlide(dotIndex));
        });

        let touchStartX = 0;
        let isTouching = false;

        track.addEventListener("touchstart", (event) => {
            isTouching = true;
            touchStartX = event.touches[0].clientX;
        }, { passive: true });

        track.addEventListener("touchend", (event) => {
            if (!isTouching) {
                return;
            }

            isTouching = false;
            const touchEndX = event.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;
            const swipeThreshold = 40;

            if (deltaX <= -swipeThreshold) {
                goToSlide(activeIndex + 1);
            } else if (deltaX >= swipeThreshold) {
                goToSlide(activeIndex - 1);
            }
        }, { passive: true });

        goToSlide(0);
    });

});
