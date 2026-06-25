document.addEventListener("DOMContentLoaded", () => {

    const grid = document.querySelector(".gallery-grid-js");

    const iso = new Isotope(grid, {
        itemSelector: ".gallery-grid-item",
        layoutMode: "masonry",
        percentPosition: true,
        transitionDuration: "0.5s"
    });

    imagesLoaded(grid, () => {
        iso.layout();
    });

    const checkboxes = document.querySelectorAll(
        ".gallery-filter-sidebar input[type='checkbox']"
    );


    const mobileSelect = document.querySelector(".gallery-filter-select");

    if (mobileSelect) {

        mobileSelect.addEventListener("change", function () {

            const filterValue = this.value;

            // Update Isotope
            iso.arrange({
                filter: filterValue
            });

            // Sync desktop checkboxes
            checkboxes.forEach((cb) => {

                const isMatch = cb.value === filterValue;

                cb.checked = isMatch;

                cb.closest(".gallery-filter-item")
                    .classList.toggle("active", isMatch);

            });

        });

    }


    checkboxes.forEach((checkbox) => {

        checkbox.addEventListener("change", () => {

            const allSnapshots = document.querySelector(
                '.gallery-filter-sidebar input[value="*"]'
            );

            if (checkbox.value === "*" && checkbox.checked) {

                // All Snapshots selected → uncheck everything else
                checkboxes.forEach((cb) => {

                    if (cb.value !== "*") {
                        cb.checked = false;
                        cb.closest(".gallery-filter-item")
                            .classList.remove("active");
                    }

                });

            } else if (checkbox.checked) {

                // Any other filter selected → uncheck All Snapshots
                allSnapshots.checked = false;
                allSnapshots.closest(".gallery-filter-item")
                    .classList.remove("active");

            }

            // Update active classes
            checkboxes.forEach((cb) => {

                cb.closest(".gallery-filter-item")
                    .classList.toggle("active", cb.checked);

            });

            // If nothing is checked, restore All Snapshots
            const anyChecked = [...checkboxes].some(cb => cb.checked);

            if (!anyChecked) {

                allSnapshots.checked = true;
                allSnapshots.closest(".gallery-filter-item")
                    .classList.add("active");

            }

            // Build Isotope filter
            const activeFilters = [];

            checkboxes.forEach((cb) => {

                if (cb.checked && cb.value !== "*") {
                    activeFilters.push(cb.value);
                }

            });

            iso.arrange({
                filter: activeFilters.length
                    ? activeFilters.join(",")
                    : "*"
            });

        });

    });

    GLightbox({
        selector: ".glightbox",
        loop: true,
        touchNavigation: true,
        keyboardNavigation: true,
        closeButton: true,
        openEffect: "zoom",
        closeEffect: "zoom"
    });


    const dropdown = document.querySelector(".gallery-custom-dropdown");
    const trigger = document.querySelector(".gallery-dropdown-trigger");
    const triggerText = trigger.querySelector("span");
    const options = document.querySelectorAll(".gallery-dropdown-option");

    if (dropdown && trigger) {

        trigger.addEventListener("click", () => {
            dropdown.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove("open");
            }
        });

        options.forEach(option => {

            option.addEventListener("click", () => {

                const filterValue = option.dataset.filter;

                triggerText.textContent = option.textContent.trim();

                options.forEach(opt =>
                    opt.classList.remove("active")
                );

                option.classList.add("active");

                dropdown.classList.remove("open");

                iso.arrange({
                    filter: filterValue
                });

                checkboxes.forEach(cb => {

                    const isMatch = cb.value === filterValue;

                    cb.checked = isMatch;

                    cb.closest(".gallery-filter-item")
                        .classList.toggle("active", isMatch);

                });

            });

        });

    }

    const mobileCheckboxes =
        document.querySelectorAll(".gallery-mobile-filter input");

    const applyButton =
        document.querySelector(".gallery-apply-filter");

    if (applyButton) {

        applyButton.addEventListener("click", () => {

            const allSnapshots =
                document.querySelector(
                    '.gallery-mobile-filter input[value="*"]'
                );

            const activeFilters = [];

            mobileCheckboxes.forEach(cb => {

                if (cb.checked && cb.value !== "*") {
                    activeFilters.push(cb.value);
                }

            });

            iso.arrange({
                filter: activeFilters.length
                    ? activeFilters.join(",")
                    : "*"
            });

            dropdown.classList.remove("open");

        });

    }

});