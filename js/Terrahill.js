document.querySelectorAll("a:not(.no)").forEach(lien => {
    lien.addEventListener("mouseenter", () => {
        lien.style.backgroundColor = "brown";
        lien.style.color = "white";
    });

    lien.addEventListener("mouseleave", () => {
        lien.style.backgroundColor = "";
        lien.style.color = "black";
    });
});

