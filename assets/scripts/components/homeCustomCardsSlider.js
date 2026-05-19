document.addEventListener("DOMContentLoaded", () => {

    const section = document.querySelector(".key-areas-section");
    const sliderWrapper = section?.querySelector(".key-areas-slider-wrapper");
    const viewport = section?.querySelector(".stackCardsSection");
    const track = section?.querySelector(".customCard-wrapper");
    const cards = track ? Array.from(track.querySelectorAll(".customCard")) : [];

    if (!section || !sliderWrapper || !viewport || !track || cards.length === 0) {
        return;
    }

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let scrollDistance = 0;
    let startY = 0;
    let ticking = false;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const lerp = (from, to, progress) => {
        return from + (to - from) * progress;
    };

    const easeOutExpo = (x) => {
        return x === 1
            ? 1
            : 1 - Math.pow(2, -10 * x);
    };

    const CARD_WIDTH = 451;
    const CARD_GAP = 70;

    const stackGap = () => CARD_WIDTH + CARD_GAP;

    const resetStyles = () => {

        sliderWrapper.style.height = "";

        cards.forEach((card) => {
            card.style.transform = "";
            card.style.zIndex = "";
        });
    };

    const measure = () => {

        if (!desktopQuery.matches) {
            resetStyles();
            return;
        }

        const stageCount = Math.max(cards.length - 1, 1);

        scrollDistance = Math.max(
            window.innerHeight * stageCount * 1.2,
            window.innerHeight
        );

        startY =
            window.scrollY +
            sliderWrapper.getBoundingClientRect().top;

        sliderWrapper.style.height =
            `${window.innerHeight + scrollDistance}px`;

        cards.forEach((card, index) => {
            card.style.zIndex = String(1000 + index);
        });
    };

    const update = () => {

        ticking = false;

        if (
            !desktopQuery.matches ||
            reduceMotionQuery.matches ||
            scrollDistance <= 0
        ) {
            resetStyles();
            return;
        }

        const progress = clamp(
            (window.scrollY - startY) / scrollDistance,
            0,
            1
        );

        cards.forEach((card, index) => {

            const depth = cards.length - index;

            /* near cards move faster */
            const speed = 0.55 + depth * 0.12;

            /* stagger */
            const perCardProgress = clamp(
                (progress - index * 0.08) * speed,
                0,
                1
            );

            const eased = easeOutExpo(perCardProgress);

            /* initial spread */
            const startX = (CARD_WIDTH + CARD_GAP) * index;

            /* ALL cards stack at same point */
            const targetX = 0;

            /* movement */
            const x = lerp(startX, targetX, eased);

            /* subtle vertical parallax */
            const y = lerp(
                index * 12,
                0,
                eased
            );

            /* alternating rotations */
            const rotation =
                index % 2 === 0
                    ? -2
                    : 2;

            card.style.transform = `
        translate3d(
            ${x}px,
            calc(-50% + ${y}px),
            0
        )
        rotate(${rotation}deg)
    `;
        });
    };

    const requestUpdate = () => {

        if (ticking) {
            return;
        }

        ticking = true;

        window.requestAnimationFrame(update);
    };

    measure();
    update();

    window.addEventListener(
        "scroll",
        requestUpdate,
        { passive: true }
    );

    window.addEventListener("resize", () => {
        measure();
        update();
    });
});