function setResultTopFromStatus() {
    const resultTable = document.querySelector("table.result thead");
    const statusTable = document.querySelector("table.resultStatus");
    const statusHeight = statusTable.getBoundingClientRect().height;
    resultTable.style.top = `${statusHeight}px`;
}

function setup() {
    console.log("Setting up ResizeObserver for resultStatus table");
    const obs = new ResizeObserver(setResultTopFromStatus);
    obs.observe(document.querySelector("table.resultStatus"));
    setResultTopFromStatus();
}

window.addEventListener("load", setup);
