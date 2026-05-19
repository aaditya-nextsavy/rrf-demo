const menuToggle = document.querySelector(".menu-toggle");
const body = document.body;

if (menuToggle) {

    menuToggle.addEventListener("click", () => {

        const isOpen = body.classList.contains("menu-open");

        if (isOpen) {

            body.classList.remove("menu-open");
            body.classList.add("menu-closed");

            setTimeout(() => {
                body.classList.remove("menu-closed");
            }, 700);

        } else {

            body.classList.remove("menu-closed");
            body.classList.add("menu-open");
        }

        menuToggle.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    });
}