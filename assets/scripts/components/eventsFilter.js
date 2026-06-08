document.addEventListener("DOMContentLoaded", () => {
    const eventsSection = document.querySelector(".events-listing-section");

    if (!eventsSection) {
        return;
    }

    const filterButtons = eventsSection.querySelectorAll(".year-span");
    const eventCards = eventsSection.querySelectorAll(".our-blog-card");
    const eventCount = eventsSection.querySelector(".annual-reports-count");

    if (!filterButtons.length || !eventCards.length || !eventCount) {
        return;
    }

    const updateCount = (visibleCount) => {
        eventCount.textContent = `${visibleCount} Events listed`;
    };

    const applyFilter = (filterValue) => {
        let visibleCount = 0;

        eventCards.forEach((card) => {
            const cardYear = card.dataset.year;
            const isVisible = filterValue === "all" || cardYear === filterValue;

            card.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        updateCount(visibleCount);
    };

    const setActiveButton = (activeButton) => {
        filterButtons.forEach((button) => {
            button.classList.remove("active");
        });

        activeButton.classList.add("active");
    };

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setActiveButton(button);
            applyFilter(button.dataset.filter);
        });
    });

    const defaultActiveButton = eventsSection.querySelector(".year-span.active") || filterButtons[0];

    setActiveButton(defaultActiveButton);
    applyFilter(defaultActiveButton.dataset.filter || "all");
});
