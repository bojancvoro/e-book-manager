
const items = ["dna", "dbhsa", "dsa", "suqn", "sjka"];

const root = document.getElementsByClassName("root")[0];

function renderItems(itemsList, domElement) {
    let itemsRendered = domElement.children.length;
    if(itemsList.length > itemsRendered) {
        const newParagraph = document.createElement("p");
        newParagraph.innerHTML = itemsList.slice(itemsRendered, itemsRendered + 1);
        domElement.appendChild(newParagraph);
        renderItems(itemsList, domElement);
    }
}

renderItems(items, root);