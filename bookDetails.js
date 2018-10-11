

const displayBookDetails = (book) => {
    const titleElement = document.getElementById("title");
    const authorsElement = document.getElementById("authors");
    const datePublishedElement = document.getElementById("date-published");
    const tagsElement = document.getElementById("tags");
    const readElement = document.getElementById("read");

    titleElement.innerHTML = book.title;
    authorsElement.innerHTML = book.authors;
    datePublishedElement.innerHTML = book.datePublished;
    tagsElement.innerHTML = book.tags;
    readElement.innerHTML = book.read;
}

const receiveMessage = (e) => {
    // if (event.origin == "http://127.0.0.1:8080") {
        displayBookDetails(e.data);
    // }
}

window.addEventListener("message", receiveMessage, false);

