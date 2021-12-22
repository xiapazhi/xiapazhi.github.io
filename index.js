const showNote = (e) => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation();
    document.getElementById("gitalk-container").classList.add("show-note")
}

const hideNote = () => {
    document.getElementById("gitalk-container").classList.remove("show-note")
}