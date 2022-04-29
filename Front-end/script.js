const quoteText = document.querySelector(".quote"),
authorName = document.querySelector(".author .name"),
quoteBtn = document.querySelector("button"),
soundBtn = document.querySelector(".sound"),
copyBtn = document.querySelector(".copy"),
twitterBtn = document.querySelector(".twitter");

function randomQuote(){
    quoteBtn.classList.add("loding");
    quoteBtn.innerText = "Loding Quote......";
    fetch("https://api.quotable.io/random").then(res=> res.json()).then(result => {
        console.log(result)
        quoteText.innerText = result.content;
        authorName.innerText = result.author;
        quoteBtn.innerText = "Next Quote";
        quoteBtn.classList.remove("loading")
    });
}

soundBtn.addEventListener("click", () => {
    let utterance = new SpeechSynthesisUtterance(`${quoteText.innerText} by ${authorName.innerText}`);
    speechSynthesis.speak(utterance);
})

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(quoteText.innerText);
})

twitterBtn.addEventListener("click", () => {
    let tweeUrl = `https://twitter.com/intent/tweet?url=${quoteText.innerText}`;
    window.open(tweeUrl, "_blank");
})

quoteBtn.addEventListener("click", randomQuote);