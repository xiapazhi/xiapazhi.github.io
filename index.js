const doNothing = () => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation();
}

const showNote = (e) => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation();
    document.getElementById("gitalk-container").classList.add("show-note")
}

const hideNote = () => {
    document.getElementById("gitalk-container").classList.remove("show-note")
}

// 计算运行时间
const begainTime = new Date(2021, 10, 22, 08, 00, 00);
const dayMs = 24 * 60 * 60 * 1000
const minMs = 60 * 60 * 1000
const sMs = 60 * 1000

const setDiff = () => {
    try {
        let now = new Date()
        let drr = now.getTime() - begainTime.getTime();
        let day = parseInt(drr / dayMs);
        let hours = parseInt(drr % dayMs / minMs);
        let minutes = parseInt(drr % minMs / sMs);
        let seconds = parseInt(drr % sMs / 1000);

        let text = `
                <span>${day} 天</span> 
                <span class="diff-detail">${hours} 时 ${minutes} 分 ${seconds} 秒</span>`;
        document.getElementById('start_time_difference').innerHTML = text
    } catch (error) {

    }
}

setDiff()
setInterval(setDiff, 1000)
// 计算运行时间 end

function isMobile () {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return true
    } else {
        return false
    }
}

//
window.onload = () => {
    if (isMobile()) {
        // todo 移动端样式优化
    } else {
        document.getElementById("gitalk-but").style.display = "block"
    }
    // 12/13 国家公祭日
    if (['12/13'].some(d => {
        return (new Date()).toLocaleDateString().indexOf(d) > 0
    })) {
        document.getElementById("BODDY").classList.add("lament")
    }
}