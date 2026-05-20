document.addEventListener("DOMContentLoaded", () => {

    const sections = Array.from(document.querySelectorAll(".key-areas-section"));

    if (sections.length === 0) {
        return;
    }

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const lerp = (from, to, progress) => from + (to - from) * progress;

    const easeOutExpo = (x) => (
        x === 1
            ? 1
            : 1 - Math.pow(2, -10 * x)
    );

    const controllers = sections.map((section) => {
        const sliderWrapper = section.querySelector(".key-areas-slider-wrapper");
        const viewport = section.querySelector(".stackCardsSection");
        const track = section.querySelector(".customCard-wrapper");
        const cards = track ? Array.from(track.querySelectorAll(".customCard")) : [];

        return {
            section,
            sliderWrapper,
            viewport,
            track,
            cards,
            scrollDistance: 0,
            startY: 0,
            cardWidth: 0,
            cardHeight: 0,
        };
    }).filter((controller) => (
        controller.sliderWrapper &&
        controller.viewport &&
        controller.track &&
        controller.cards.length > 0
    ));

    if (controllers.length === 0) {
        return;
    }

    let ticking = false;

    const isDesktopSection = (controller) => controller.section.classList.contains("desktop");
    const isMobileSection = (controller) => controller.section.classList.contains("mobile");
    const isControllerActive = (controller) => (
        desktopQuery.matches
            ? isDesktopSection(controller)
            : isMobileSection(controller)
    );

    const resetStyles = (controller) => {
        controller.sliderWrapper.style.height = "";

        controller.cards.forEach((card) => {
            card.style.transform = "";
            card.style.zIndex = "";
        });
    };

    const measureCardSize = (controller) => {
        const firstCard = controller.cards[0];

        if (!firstCard) {
            controller.cardWidth = 0;
            controller.cardHeight = 0;
            return;
        }

        const rect = firstCard.getBoundingClientRect();

        controller.cardWidth = rect.width || firstCard.offsetWidth || 0;
        controller.cardHeight = rect.height || firstCard.offsetHeight || 0;
    };

    const measure = () => {
        controllers.forEach((controller) => {
            if (!isControllerActive(controller) || reduceMotionQuery.matches) {
                resetStyles(controller);
                return;
            }

            measureCardSize(controller);

            const stageCount = Math.max(controller.cards.length - 1, 1);

            // controller.scrollDistance = Math.max(
            //     window.innerHeight * stageCount * 1.2,
            //     window.innerHeight
            // );

            // controller.scrollDistance = Math.max(
            //     window.innerHeight * stageCount * 0.65,
            //     window.innerHeight * 0.8
            // );

            controller.scrollDistance = window.innerHeight * stageCount * 0.55;

            controller.startY =
                window.scrollY +
                controller.sliderWrapper.getBoundingClientRect().top;

            controller.sliderWrapper.style.height =
                `${window.innerHeight + controller.scrollDistance}px`;

            controller.cards.forEach((card, index) => {
                card.style.zIndex = String(1000 + index);
            });
        });
    };

    const updateController = (controller) => {
        if (
            !isControllerActive(controller) ||
            reduceMotionQuery.matches ||
            controller.scrollDistance <= 0
        ) {
            resetStyles(controller);
            return;
        }

        const progress = clamp(
            (window.scrollY - controller.startY) / controller.scrollDistance,
            0,
            1
        );

        controller.cards.forEach((card, index) => {
            const depth = controller.cards.length - index;
            const speed = 0.55 + depth * 0.12;
            const perCardProgress = clamp(
                (progress - index * 0.08) * speed,
                0,
                1
            );

            const eased = easeOutExpo(perCardProgress);
            // const rotation = index % 2 === 0 ? -2 : 2;

            const rotation = desktopQuery.matches
                ? (index % 2 === 0 ? -2 : 2)
                : (index % 2 === 0 ? -1 : 1);



            if (desktopQuery.matches) {
                // const startX = (controller.cardWidth + 70) * index;
                // const startX = (controller.cardWidth * 0.35) * index;
                const startX = (controller.cardWidth + 20) * index;

                const x = lerp(startX, 0, eased);
                const y = lerp(index * 12, 0, eased);

                card.style.transform = `
                translate3d(
                    ${x}px,
                    calc(-50% + ${y}px),
                    0
                )
                rotate(${rotation}deg)
            `;
                return;
            }

            // const startY = (controller.cardHeight + 70) * (index + 1);
            // const startY = (controller.cardHeight * 0.35) * (index + 1);
            const startY = (controller.cardHeight + 20) * (index + 1);

            const y = lerp(startY, 0, eased);

            card.style.transform = `
                translate3d(
                    -50%,
                    calc(-50% + ${y}px),
                    0
                )
                rotate(${rotation}deg)
            `;
        });
    };

    const update = () => {
        ticking = false;
        controllers.forEach(updateController);
    };

    const requestUpdate = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(update);
    };

    const refresh = () => {
        measure();
        update();
    };

    refresh();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", refresh);
});
