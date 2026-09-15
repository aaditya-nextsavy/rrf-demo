document.addEventListener("DOMContentLoaded", () => {
    const eventsSection = document.querySelector(".events-listing-section");

    if (!eventsSection) {
        return;
    }

    const yearFilter = eventsSection.querySelector(".year-filter");
    const eventCards = eventsSection.querySelectorAll(".our-blog-card");
    const eventCount = eventsSection.querySelector(".annual-reports-count");

    if (!yearFilter || !eventCards.length || !eventCount) {
        return;
    }

    const years = Array.from(
        new Set(Array.from(eventCards, (card) => card.dataset.year).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));

    yearFilter.innerHTML = "";

    const createFilterButton = (filterValue, label, isActive) => {
        const button = document.createElement("span");
        button.className = isActive ? "year-span active" : "year-span";
        button.dataset.filter = filterValue;
        button.textContent = label;
        yearFilter.appendChild(button);
        return button;
    };

    const allButton = createFilterButton("all", "All", true);
    years.forEach((year) => createFilterButton(year, year, false));

    const filterButtons = yearFilter.querySelectorAll(".year-span");

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

    setActiveButton(allButton);
    applyFilter("all");
});
