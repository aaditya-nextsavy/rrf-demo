(() => {
    const modal = document.querySelector(".trustee-modal");
    const readMoreButtons = document.querySelectorAll(".trustee-read-more");

    if (!modal || !readMoreButtons.length) {
        return;
    }

    const nameEl = modal.querySelector(".trustee-modal-name");
    const roleEl = modal.querySelector(".trustee-modal-role");
    const bodyEl = modal.querySelector(".trustee-modal-description");

    const openModal = (wrapper) => {
        const name = wrapper.querySelector(".trustee-name h3")?.textContent.trim() ?? "";
        const role = wrapper.querySelector(".trustee-name h5")?.textContent.trim() ?? "";
        const paragraphs = wrapper.querySelectorAll(".about-trustee-description p");

        if (nameEl) nameEl.textContent = name;
        if (roleEl) roleEl.textContent = role;

        if (bodyEl) {
            bodyEl.innerHTML = "";
            paragraphs.forEach((p) => {
                const clone = document.createElement("p");
                clone.textContent = p.textContent.trim();
                bodyEl.appendChild(clone);
            });
        }

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("trustee-modal-open");
    };

    const closeModal = () => {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("trustee-modal-open");
    };

    readMoreButtons.forEach((btn) => {
        const wrapper = btn.closest(".trustee-info-wrapper");
        const paragraphCount = wrapper?.querySelectorAll(".about-trustee-description p").length ?? 0;

        if (paragraphCount <= 1) {
            btn.style.display = "none";
            return;
        }

        btn.setAttribute("type", "button");
        btn.addEventListener("click", () => openModal(wrapper));
    });

    modal.querySelectorAll("[data-trustee-modal-close]").forEach((el) => {
        el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("open")) {
            closeModal();
        }
    });
})();
