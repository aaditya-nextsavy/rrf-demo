(() => {
    const modal = document.querySelector(".trustee-modal");
    const readMoreButtons = document.querySelectorAll(".trustee-read-more");

    if (!modal || !readMoreButtons.length) {
        return;
    }

    const nameEl = modal.querySelector(".trustee-modal-name");
    const roleEl = modal.querySelector(".trustee-modal-role");
    const bodyEl = modal.querySelector(".trustee-modal-description");

    // Cache each preview paragraph's full, untruncated text so the modal
    // always shows the complete bio even while the on-page preview is
    // shortened for small screens.
    const fullBioText = new WeakMap();

    document.querySelectorAll(".trustee-bio-text").forEach((el) => {
        fullBioText.set(el, el.textContent.trim().replace(/\s+/g, " "));
    });

    const truncateToHalf = (text) => {
        const targetLength = Math.round(text.length / 2);
        if (targetLength >= text.length) {
            return text;
        }
        let truncated = text.slice(0, targetLength);
        const lastSpace = truncated.lastIndexOf(" ");
        if (lastSpace > 0) {
            truncated = truncated.slice(0, lastSpace);
        }
        return truncated.trim() + "…";
    };

    const smallScreenQuery = window.matchMedia("(max-width: 1240px)");

    const applyBioPreviewLength = () => {
        const isSmall = smallScreenQuery.matches;
        document.querySelectorAll(".trustee-bio-text").forEach((el) => {
            const full = fullBioText.get(el) ?? el.textContent.trim();
            el.textContent = isSmall ? truncateToHalf(full) : full;
        });
    };

    applyBioPreviewLength();
    smallScreenQuery.addEventListener("change", applyBioPreviewLength);

    const getParagraphText = (p) => {
        const bioTextEl = p.querySelector(".trustee-bio-text");
        if (bioTextEl) {
            return fullBioText.get(bioTextEl) ?? bioTextEl.textContent.trim();
        }
        return p.textContent.trim();
    };

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
                clone.textContent = getParagraphText(p);
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
