document.addEventListener("DOMContentLoaded", () => {


    const gallerySection = document.querySelector(".gallery-filter-section");
    function scrollToGallery() {

        if (!gallerySection) return 150;

        const offset = 100;

        const sectionTop = gallerySection.offsetTop;
        const sectionHeight = gallerySection.offsetHeight;

        const currentScroll = window.scrollY;

        // 0 = top of section, 1 = bottom of section
        const progress = (currentScroll - sectionTop) / sectionHeight;

        window.scrollTo({
            top: sectionTop - offset,
            behavior: "smooth"
        });

        // Return a delay based on how far down the section the user is
        return progress > 0.6 ? 450 : 150;

    }



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




            const delay = scrollToGallery();

            setTimeout(() => {
                iso.arrange({
                    filter: filterValue
                });
            }, delay);

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

            if (checkbox.checked) {

                // Uncheck every other option
                checkboxes.forEach(cb => {
                    if (cb !== checkbox) {
                        cb.checked = false;
                    }
                });

            } else {

                // Prevent having nothing selected
                checkbox.checked = true;

            }

            // Update active classes
            checkboxes.forEach(cb => {

                cb.closest(".gallery-filter-item")
                    .classList.toggle("active", cb.checked);

            });

            // Apply selected filter
            const selected =
                document.querySelector(".gallery-filter-sidebar input:checked");

            const filterValue = selected ? selected.value : "*";

            const delay = scrollToGallery();

            setTimeout(() => {
                iso.arrange({
                    filter: filterValue
                });
            }, delay);

            // Sync mobile
            mobileCheckboxes.forEach(cb => {
                cb.checked = cb.value === filterValue;
            });

            // Update mobile button text
            if (triggerText) {
                const mobileSelected = document.querySelector(
                    `.gallery-mobile-filter input[value="${filterValue}"]`
                );

                if (mobileSelected) {
                    triggerText.textContent =
                        mobileSelected.closest(".gallery-mobile-filter")
                            .querySelector("span").textContent;
                }
            }

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
    const triggerText = trigger?.querySelector("span");

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

                const delay = scrollToGallery();

                setTimeout(() => {
                    iso.arrange({
                        filter: filterValue
                    });
                }, delay);

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

    // Only allow one checkbox to be selected
    mobileCheckboxes.forEach(cb => {

        cb.addEventListener("change", () => {

            if (cb.checked) {
                mobileCheckboxes.forEach(other => {
                    if (other !== cb) {
                        other.checked = false;
                    }
                });
            } else {
                // Prevent having nothing selected
                cb.checked = true;
            }

        });

    });

    if (applyButton) {

        applyButton.addEventListener("click", () => {

            const selected =
                document.querySelector(".gallery-mobile-filter input:checked");

            const filterValue = selected ? selected.value : "*";

            const delay = scrollToGallery();

            setTimeout(() => {

                // Apply Isotope filter
                iso.arrange({
                    filter: filterValue
                });

                // Update trigger text
                if (selected) {
                    triggerText.textContent =
                        selected.closest(".gallery-mobile-filter")
                            .querySelector("span").textContent;
                } else {
                    triggerText.textContent = "Filters";
                }

                // Sync desktop sidebar
                checkboxes.forEach(cb => {

                    const isMatch = cb.value === filterValue;

                    cb.checked = isMatch;

                    cb.closest(".gallery-filter-item")
                        .classList.toggle("active", isMatch);

                });

            }, delay);

            // Close dropdown immediately
            dropdown.classList.remove("open");

        });

    }

});