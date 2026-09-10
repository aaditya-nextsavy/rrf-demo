(() => {
    const dropdowns = document.querySelectorAll(".contact-custom-dropdown");

    dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector(".contact-dropdown-trigger");
        const triggerLabel = trigger?.querySelector("span");
        const menu = dropdown.querySelector(".contact-dropdown-menu");

        if (!trigger || !menu) {
            return;
        }

        const placeholder = triggerLabel?.textContent ?? "";

        const close = () => {
            dropdown.classList.remove("open");
            trigger.setAttribute("aria-expanded", "false");
        };

        const toggle = () => {
            const isOpen = dropdown.classList.toggle("open");
            trigger.setAttribute("aria-expanded", String(isOpen));
        };

        trigger.setAttribute("type", "button");
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");

        trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            toggle();
        });

        menu.addEventListener("change", (event) => {
            const input = event.target.closest('input[type="radio"]');

            if (!input) {
                return;
            }

            const optionLabel = input.closest(".form-checkbox-item")?.querySelector("span");

            if (optionLabel && triggerLabel) {
                triggerLabel.textContent = optionLabel.textContent;
            }

            close();
        });

        document.addEventListener("click", (event) => {
            if (!dropdown.contains(event.target)) {
                close();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                close();
            }
        });

        dropdown.addEventListener("reset", () => {
            if (triggerLabel) {
                triggerLabel.textContent = placeholder;
            }
        });

        dropdown.closest("form")?.addEventListener("reset", () => {
            if (triggerLabel) {
                triggerLabel.textContent = placeholder;
            }
        });
    });
})();
