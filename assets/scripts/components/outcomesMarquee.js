/*
 * Fills every image marquee (.outcomes-marquee-track) with a freshly
 * shuffled set of photos on each page load, so no two pages (or two
 * marquees on the same page) show the same sequence.
 *
 * Each track gets every image exactly once, followed by an identical copy
 * for the seamless CSS loop - so an image never repeats next to itself.
 */
(() => {
    const script = document.currentScript;
    if (!script) {
        return;
    }

    // assets/scripts/components/ -> assets/media/
    const mediaBase = new URL("../../media/", script.src);

    const IMAGES = [
        "home/outcome1.webp",
        "home/outcome2.webp",
        "home/outcome3.webp",
        "home/outcome4.webp",
        "marquee/pool-1.jpg",
        "marquee/pool-2.jpg",
        "marquee/pool-3.jpg",
        "marquee/pool-4.jpg",
        "marquee/pool-5.jpg",
        "marquee/pool-6.jpg",
        "marquee/pool-7.jpg",
        "marquee/pool-8.jpg",
        "marquee/pool-9.jpg",
    ];

    // Speed in the CSS was tuned for 5 images per loop; scale the duration
    // so the scroll speed stays the same with the larger set.
    const ORIGINAL_ITEMS_PER_LOOP = 5;

    const shuffle = (list) => {
        const result = list.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    const createItem = (path, isCopy) => {
        const item = document.createElement("div");
        item.className = "outcomes-marquee-item";
        if (isCopy) {
            item.setAttribute("aria-hidden", "true");
        }

        const img = document.createElement("img");
        img.src = new URL(path, mediaBase).href;
        img.alt = "";
        img.decoding = "async";
        img.draggable = false;

        item.appendChild(img);
        return item;
    };

    const tracks = document.querySelectorAll(".outcomes-marquee-track");
    let previousFirst = null;

    tracks.forEach((track) => {
        let order = shuffle(IMAGES);

        // Cards tilt by nth-child(odd/even); an odd count per loop would flip
        // the tilt of the copy and cause a visible jump at the loop point.
        if (order.length % 2 !== 0) {
            order.pop();
        }

        // Two marquees on one page (e.g. home + footer) should not open
        // with the same photo.
        if (order[0] === previousFirst) {
            order.push(order.shift());
        }
        previousFirst = order[0];

        const fragment = document.createDocumentFragment();
        order.forEach((path) => fragment.appendChild(createItem(path, false)));
        order.forEach((path) => fragment.appendChild(createItem(path, true)));

        track.style.setProperty("--marquee-scale", order.length / ORIGINAL_ITEMS_PER_LOOP);
        track.replaceChildren(fragment);
    });
})();
