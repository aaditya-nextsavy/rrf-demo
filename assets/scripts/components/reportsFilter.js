document.addEventListener("DOMContentLoaded", () => {

    const filterButtons = document.querySelectorAll(".year-span");
    const reportItems = document.querySelectorAll(".report-list-item");
    const reportCount = document.querySelector(".annual-reports-count");

    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const filterValue = button.dataset.filter;

            // REMOVE ACTIVE CLASS
            filterButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            // ADD ACTIVE CLASS
            button.classList.add("active");

            let visibleCount = 0;

            reportItems.forEach((item) => {

                const itemYear = item.dataset.year;

                if (filterValue === "all" || itemYear === filterValue) {

                    item.style.display = "flex";
                    visibleCount++;

                } else {

                    item.style.display = "none";

                }

            });

            // UPDATE COUNT
            reportCount.textContent = `${visibleCount} Reports listed`;

        });

    });

});