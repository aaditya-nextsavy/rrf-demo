// Keeps descriptions on the same line across cards in a row by giving the
// blocks above them (icon, title) the tallest height found in that row.
document.addEventListener("DOMContentLoaded", () => {
    const groups = [
        { card: ".services-custom-card", parts: [".services-custom-card-icon", ".services-custom-card-title"] },
        { card: ".customCard", parts: [".customCard-icon", ".customCard-title"] },
    ];

    const equalize = () => {
        groups.forEach(({ card, parts }) => {
            const cards = [...document.querySelectorAll(card)];

            if (!cards.length) {
                return;
            }

            parts.forEach((part) => {
                const items = cards.map((c) => c.querySelector(part)).filter(Boolean);
                items.forEach((el) => (el.style.minHeight = ""));

                // Cards sharing a top edge (and parent) form one visual row
                const rows = new Map();
                items.forEach((el) => {
                    const c = el.closest(card);
                    const key = c.parentElement;
                    const top = c.offsetTop;
                    if (!rows.has(key)) rows.set(key, new Map());
                    const row = rows.get(key);
                    if (!row.has(top)) row.set(top, []);
                    row.get(top).push(el);
                });

                rows.forEach((row) => {
                    row.forEach((els) => {
                        if (els.length < 2) return;
                        const max = Math.max(...els.map((el) => el.offsetHeight));
                        els.forEach((el) => (el.style.minHeight = `${max}px`));
                    });
                });
            });
        });
    };

    let frame;
    const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(equalize);
    };

    schedule();
    window.addEventListener("load", schedule);
    window.addEventListener("resize", schedule);

    if (document.fonts) {
        document.fonts.ready.then(schedule);
    }
});
