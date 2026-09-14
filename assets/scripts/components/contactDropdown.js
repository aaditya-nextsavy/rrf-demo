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

            const selectedItem = input.closest(".form-checkbox-item");
            const optionLabel = selectedItem?.querySelector("span");

            if (optionLabel && triggerLabel) {
                triggerLabel.textContent = optionLabel.textContent;
            }

            menu.querySelectorAll(".form-checkbox-item").forEach((item) => {
                item.classList.toggle("is-selected", item === selectedItem);
            });

            trigger.classList.add("contact-dropdown-trigger--selected");

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
            trigger.classList.remove("contact-dropdown-trigger--selected");
            menu.querySelectorAll(".form-checkbox-item.is-selected").forEach((item) => {
                item.classList.remove("is-selected");
            });
        });

        dropdown.closest("form")?.addEventListener("reset", () => {
            if (triggerLabel) {
                triggerLabel.textContent = placeholder;
            }
            trigger.classList.remove("contact-dropdown-trigger--selected");
            menu.querySelectorAll(".form-checkbox-item.is-selected").forEach((item) => {
                item.classList.remove("is-selected");
            });
        });
    });
})();
