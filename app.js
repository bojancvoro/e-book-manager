

const Model = (() => {

    const endpoint = "https://www.googleapis.com/books/v1/volumes?q=";
    // const apiKey = "AIzaSyB3SLjylQHPkPVBYO2GGosV7JRzFr3h4pU";

    const localLibrary = JSON.parse(localStorage.getItem("localLibrary")) || [];
    let searchResults;

    function Book(bookIndex) {
        const book = searchResults[bookIndex].volumeInfo;
        this.title = book.title;
        this.authors = book.authors;
        this.datePublished = book.publishedDate;
        this.tags = [];
        this.read = false;
        this.bookId = localLibrary.length + 1;
    }

    const getLocalLibrary = () => {
        return localLibrary;
    }

    const searchBooksOnline = (searchTerm, displaySearchResults) => {
        fetch(endpoint + searchTerm + "&max-results=20")
            .then(response => response.json())
            .then(data => {
                searchResults = data.items;
                console.log("more info on the book: " + searchResults[0].volumeInfo.infoLink);
                return data.items;
            })
            .then(books => displaySearchResults(books))
            .catch(() => console.log("error fetching data"));
    }

    const searchBooksLocaly = (searchTerm) => {
        const results = localLibrary.myFilter((book) => {
            return book.title.toLowerCase().includes(searchTerm.toLowerCase());
        })
        return results;
    }

    const addBookToLibrary = (newBook) => {
        const bookInLibrary = localLibrary.find((libraryBook) => {
            return libraryBook.title === newBook.title;
        });
        if (!bookInLibrary) {
            localLibrary.push(newBook);
            localStorage.setItem("localLibrary", JSON.stringify(localLibrary));
        } else {
            alert("book in in library already");
        }

    }

    Array.prototype.myFilter = function (callback) {
        const result = [];
        for (let i = 0; i < this.length; i++) {
            if (callback(this[i])) {
                result.push(this[i])
            }
        }
        return result;
    }

    const filterByAuthor = (author) => {
        // returns list of books with author that has been received (to be used by View.displayBooks)
        return localLibrary.myFilter((book) => {
            return book.authors.join(" ") === author;
        });
    }

    const filterByTag = (tag) => {
        // returns list of books with tag that has been received (to be used by View.displayBooks)
        return localLibrary.myFilter((tagsList) => {
            return tagsList.includes(tag);
        });
    }

    const postBookDataToDetailsPage = (bookId) => {
        const selectedBook = localLibrary.find((book) => {
            return book.bookId == bookId;
        });
        const detailsPage = document.getElementsByTagName("iframe")[0].contentWindow;
        detailsPage.postMessage(selectedBook, "*");
    }

    return {
        localLibrary,
        getLocalLibrary,
        addBookToLibrary,
        searchBooksOnline,
        searchBooksLocaly,
        filterByAuthor,
        postBookDataToDetailsPage,
        searchResults,
        Book
    }

})();


const View = (() => {

    // Elements

    const bookListUl = document.getElementsByClassName("book-list")[0];
    const filtersElement = document.getElementsByClassName("filters")[0];
    const searchResultsElement = document.getElementsByClassName("search-results")[0];

    const takeSearchTerm = (e) => {
        return e.target.value;
    }

    const takeBookIndex = (e) => {
        return e.target.getAttribute("key");
    }

    //     this.authors = book.authors;
    //     this.datePublished = book.publishedDate;
    //     this.tags = [];
    //     this.read = false;

    const createBookElement = (book) => {
        const bookElement = document.createElement("li");

        const titleElement = document.createElement("span");
        titleElement.innerHTML = book.title;
        bookElement.appendChild(titleElement);

        const authorsElement = document.createElement("span");
        authorsElement.innerHTML = book.authors;
        bookElement.appendChild(authorsElement);

        const datePublishedElement = document.createElement("span");
        datePublishedElement.innerHTML = book.datePublished;
        bookElement.appendChild(datePublishedElement);

        const tagsElement = document.createElement("span");
        tagsElement.innerHTML = book.tags.length == 0 ? "no tags" : book.tags;
        bookElement.appendChild(tagsElement);

        const readElement = document.createElement("span");
        readElement.innerHTML = book.read;
        bookElement.appendChild(readElement);

        const bookId = book.bookId;
        bookElement.setAttribute("id", bookId);

        return bookElement;
    }

    const displayBooks = (bookList) => {
        let booksDisplayed = bookListUl.children.length;
        if (bookList && bookList.length > booksDisplayed) {
            const bookElement = createBookElement(bookList[booksDisplayed]);
            bookListUl.appendChild(bookElement);
            displayBooks(bookList);
        }
    }

    const displayFilteredBookList = (filteredList) => {
        let html = "";
        filteredList.forEach((book, i) => {
            html += `<li key=${i}>${book.title}</li>`
        });
        bookListUl.innerHTML = html;
    }

    const displaySearchResults = (results) => {
        let html;
        if (results.length > 0) {
            html = results.map((book, i) => {
                return (
                    `<li 
                        key=${i}>
                        ${book.volumeInfo ?
                        `${book.volumeInfo.title}
                            <button key=${i} class="addToLibrary">Add</button>` :
                        book.title}
                    </li>`
                )
            });
            html.join("");
        } else {
            html = "No results";
        }
        searchResultsElement.innerHTML = html;
    }

    const hideSearshResults = () => {
        searchResultsElement.innerHTML = "";
    }

    const displayAuthors = (bookList) => {
        // takes authors from bookList (local library) and fills drop down menu with author names
        const authorsDropdown = document.getElementById("authors");
        let html;
        bookList.forEach((book, i) => {
            html += `<option key=${i}>${book.authors.join(" ")}</option>`
        });
        authorsDropdown.innerHTML += html;
    }

    const displayTags = (bookList) => {
        // takes tags from bookList (local library) and fills drop down menu with author names
    }

    return {
        takeSearchTerm,
        takeBookIndex,
        displayBooks,
        displayFilteredBookList,
        displaySearchResults,
        hideSearshResults,
        displayAuthors
    }

})();

const Controller = (() => {
    // Elements
    const onlineSearchInput = document.getElementsByClassName("online-search")[0];
    const localSearchInput = document.getElementsByClassName("local-search")[0];
    const searchResultsElement = document.getElementsByClassName("search-results")[0];
    const bookListUl = document.getElementsByClassName("book-list")[0];
    const authorsSelectElement = document.getElementById("authors");

    // Event handlers
    const handleOnlineSearch = (e) => {
        const searchTerm = View.takeSearchTerm(e);
        Model.searchBooksOnline(searchTerm, View.displaySearchResults);
    }

    const handleLocalSearch = (e) => {
        const searchTerm = View.takeSearchTerm(e);
        const searchResults = Model.searchBooksLocaly(searchTerm);
        View.displaySearchResults(searchResults);
    }

    const handleHideSearchResults = () => {
        View.hideSearshResults();
    }

    const handleAddBookToLibrary = (e) => {
        // stop propagation is here to stop trigering handleHideSearchReasults when
        // click is searchResulstElement
        if (e.target.tagName === "BUTTON") {
            const bookIndex = View.takeBookIndex(e);
            newBook = new Model.Book(bookIndex);
            Model.addBookToLibrary(newBook);
            View.displayBooks(Model.getLocalLibrary());
            e.stopPropagation();
        } else {
            e.stopPropagation();
        }
    }

    const handleFilterByAuthor = (e) => {
        const author = e.target.value;
        if (author) {
            const filteredByAuthor = Model.filterByAuthor(author);
            View.displayFilteredBookList(filteredByAuthor);
        }
    }

    const handlePostBookDataToDetailsPage = (e) => {
        if (e.target.tagName === "SPAN") {
            const bookId = e.target.parentElement.id;
            Model.postBookDataToDetailsPage(bookId);
        }
    }

    // Event listeners
    onlineSearchInput.addEventListener("input", handleOnlineSearch);
    searchResultsElement.addEventListener("click", handleAddBookToLibrary);
    localSearchInput.addEventListener("input", handleLocalSearch);
    document.addEventListener("click", handleHideSearchResults);
    bookListUl.addEventListener("click", handlePostBookDataToDetailsPage);
    authorsSelectElement.addEventListener("click", handleFilterByAuthor);

    window.onload = () => {
        Model.localLibrary = JSON.parse(localStorage.getItem("localLibrary"));
        View.displayBooks(Model.getLocalLibrary());
        View.displayAuthors(Model.getLocalLibrary());
    }

})(Model, View);





