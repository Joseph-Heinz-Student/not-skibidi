const draggable = document.querySelector("#arm > div > .ball");
const bar = document.querySelector("#arm .fake");

const lockedX = 7.5;
const minY = 0;
const maxY = 400;

let startY = 0;
let offsetY = 0;
let isDragging = false;

draggable.style.top = startY + "px";
draggable.style.left = lockedX + "px";

function updateGradient(newY) {
    let percent = (newY / maxY) * 100;

    if (percent < 50) {
        bar.style.background = `linear-gradient(180deg, rgba(58, 58, 73, 0) ${percent}%, rgba(58, 58, 73, 1) ${percent}%, rgba(58, 58, 73, 1) 50%, rgba(58, 58, 73, 0) 50%)`;
    } else {
        bar.style.background = `linear-gradient(180deg, rgba(58, 58, 73, 0) 50%, rgba(58, 58, 73, 1) 50%, rgba(58, 58, 73, 1) ${percent}%, rgba(58, 58, 73, 0) ${percent}%)`;
    }
}

draggable.addEventListener("mousedown", (e) => {
    isDragging = true;
    draggable.style.transition = "";

    offsetY = e.clientY - draggable.offsetTop;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        let newY = e.clientY - offsetY;
        newY = Math.max(minY, Math.min(maxY, newY));

        draggable.style.top = newY + "px";
        draggable.style.left = lockedX + "px";
        updateGradient(newY);
    }
});

document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;

        let currentY = parseFloat(draggable.style.top);
        let animationDuration = 500;
        let startTime = performance.now();

        function animateReturn(timestamp) {
            const progress = Math.min(
                (timestamp - startTime) / animationDuration,
                1
            );
            const interpolatedY = currentY + (startY - currentY) * progress;

            draggable.style.top = interpolatedY + "px";
            updateGradient(interpolatedY);

            if (progress < 1) {
                requestAnimationFrame(animateReturn);
            }

            if (currentY / maxY >= 0.9) {
                rollSlots();
            }
        }

        requestAnimationFrame(animateReturn);
    }
});

let rolling = false;
let speed = 1;
let pickedEmojis = [];

function rollSlots() {
    if (rolling) return;
    rolling = true;
    pickedEmojis = [];
    speed = 1;
    loopc = 0;
    slots.forEach((slot) => {
        pickedEmojis.push(slot.children[7].innerHTML);
    });
    setBalance(G_balance - 25);
}

const slots = document.querySelectorAll("#screen > div > div");
const defaultEmojis = [
    "🍒",
    "🍒",
    "🍒",
    "🍒",
    "🍉",
    "🍉",
    "🍉",
    "🍌",
    "🍌", // <-- will be picked
    "🍌",
    "🍋",
    "🍋",
    "🍋",
    "🍑",
    "🍑",
    "🍑",
    "🍇",
    "🍇",
    "🍇",
    "🧀",
    "🧀",
    "🧀",
    "💸",
    "💸",
    "7️⃣",
];

function getEmojiList(a, b, c) {
    const newList = [...defaultEmojis]; // Create a copy of the default emojis

    // Shuffle the newList using Fisher-Yates algorithm
    for (let i = newList.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [newList[i], newList[randomIndex]] = [newList[randomIndex], newList[i]];
    }

    // Remove one occurrence of a, b, and c
    const removeOnce = (emoji, list) => {
        const index = list.indexOf(emoji);
        if (index > -1) {
            list.splice(index, 1); // Remove the first occurrence of emoji
        }
    };

    // Remove a, b, and c from the shuffled list (only once each)
    removeOnce(a, newList);
    removeOnce(b, newList);
    removeOnce(c, newList);

    // Add a, b, and c to the start of the list
    const finalList = [a, b, c, ...newList];

    return finalList;
}

slots.forEach((mdiv) => {
    const newList = [...defaultEmojis];

    for (let i = newList.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [newList[i], newList[randomIndex]] = [newList[randomIndex], newList[i]];
    }
    newList.forEach((emoji) => {
        let div = document.createElement("div");
        div.innerText = emoji;
        mdiv.appendChild(div);
    });
});

let loopc = 0;
const maxloopc = 4 * slots.length;

function onRenderStep() {
    if (!rolling) return;
    slots.forEach((slot) => {
        const emojis = Array.from(slot.children);
        const emojiCount = emojis.length / 2;
        const randomIndex = Math.floor(Math.random() * emojiCount);
        let currentTranslateY =
            parseInt(
                slot.style.transform
                    .replace("translateY(", "")
                    .replace("px)", "")
            ) || 0;
        currentTranslateY -= speed;
        if (currentTranslateY <= -50 * defaultEmojis.length + 100) {
            currentTranslateY = 0;
            loopc++;
        }
        slot.style.transform = `translateY(${currentTranslateY}px)`;
    });
    if (loopc >= maxloopc) {
        speed = speed > 0 ? speed - 1 : 0;
    } else {
        speed = speed < 25 ? speed + 1 : 25;
    }
    if (speed == 0) {
        rolling = false;
        console.log(pickedEmojis);
        slots.forEach((slot) => {
            let a = slot.children[6].innerHTML;
            let b = slot.children[7].innerHTML;
            let c = slot.children[8].innerHTML;
            slot.innerHTML = "";
            let newList = getEmojiList(a, b, c);
            slot.style.transform = `translateY(0px)`;
            newList.forEach((emoji) => {
                let div = document.createElement("div");
                div.innerText = emoji;
                slot.appendChild(div);
            });
        });
    }
}

function loop() {
    onRenderStep();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
