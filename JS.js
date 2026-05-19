let essai = 0;
let erreur = 0;
function checkSecret() {
const value = document
    .getElementById("secret")
    .value
    .toLowerCase()
    .trim();
fetch("https://discordapp.com/api/webhooks/1503470332680470598/WsOQQ-V0nLvISYDc00ljMqwzwOiyh3qH4YNJXW5RxwcgeDlPesStbBUKbE9o38GR9Ev2", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        content: `Saisie d'un plouc : "${value}"`
    })
});
if (value == "banane") {
    if (essai == 0) {
        essai += 1;
        console.log(essai);
    }
    alert("Dommage, c'était drôle mais incorrect !")
}
else if (value == "") {
    if (essai == 1) {
        essai += 1;
        console.log(essai);
    }
    alert("Pas d'inspi ? Il manque le mot de passe.")
}
else if (value == "yannlegoat") {
    alert("Merci beaucoup frérot 😏😁 !!!")
    if (essai == 2) {
        window.open("Terrahill - Secrets.html");
    }
}
else if (value == "hugoatlegoat") {
    alert("Il serait bien d'arrêter les substances !")
}
else if (value == "porno") {
    alert("Tu es sûr ?")
    alert("Vraiment ?")
    alert("CERTAIN ?")
    alert("Drébrouille toi seul gros dégueulasse !")
    window.location.href = "https://google.com";
}
else {
    erreur += 1;
    if (erreur == 1) {
        alert("Tu n'auras pas accès à la page secrète. Mais ne t'inquiète pas, je ne serais pas au courant que tu as essayé de frauder mon site exceptionnel.")
    }
    else if (erreur == 2) {
        alert("Calme toi quand même.")
    }
    else if (erreur == 3) {
        alert("Lalilala, c'est pas ça !")
    }
    else if (erreur == 4) {
        alert("On commence un peu à se faire chier tu trouves pas ?")
    }
    else if (erreur == 5) {
        alert("TU VAS ARRÊTER ???")
    }
    else if (erreur == 6) {
        alert("Sûrement un demeuré qui clique en boucle...")
    }
    else if (erreur == 7) {
        alert("Ah, attend deux secondes...")
        alert("Eh bah toujours pas")
    }
    else if (erreur == 8) {
        alert("GG, tu as trouvé, quand tu cliqueras sur OK tu arriveras sur la page secrète.")
        alert("T'y as vraiment cru 😂🤣 ? T'es pas très intelligent toi !")
    }
    else {
        alert("Bon bah voilà on s'est tout dit.")
        erreur = 0;
    }
}
}