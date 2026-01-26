const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();

const booksToArray = (obj) => Object.entries(obj).map(([isbn, book]) => ({ ...book, ISBN: String(isbn) }));

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    const response = await axios.get(`http://localhost:5000/async/`); // using axios

    res.status(200).json(response.data);
});
// called by axios: (the book list available in the shop)
public_users.get('/async/', (req, res) => {
    try {
        res.status(200).json(booksToArray(books))
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});  // called by axios (array of books)


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    axios.get(`http://localhost:5000/async/title/${encodeURIComponent(title)}`)
        .then(response => res.status(200).json(response.data))
        .catch(err => res.status(404).json({ message: `Title not found (${title})` }));
});
// called by axios: (all books based on title)
public_users.get('/async/title/:title', (req, res) => {
    try {
        const title = req.params.title;

        const booksArray = booksToArray(books);
        const booksByTitle = booksArray.filter(b => b.title === title);

        if (booksByTitle.length > 0) res.status(200).json(booksByTitle);
        else res.status(404).json({ message: `Title not found (${title})` });
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    axios.get(`http://localhost:5000/async/isbn/${isbn}`)
        .then(response => res.status(200).json(response.data))
        .catch(err => res.status(404).json({ message: `ISBN not found (${isbn})` }));
});
// called by axios: (Get book details based on ISBN)
public_users.get('/async/isbn/:isbn', (req, res) => {
    try {
        const isbn = req.params.isbn;
        const bookByIsbn = books[isbn];

        if (bookByIsbn) res.status(200).json(bookByIsbn);
        else res.status(404).json({ message: `Book not found (${isbn})` });
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    axios.get(`http://localhost:5000/async/author/${encodeURIComponent(author)}`)
        .then(response => res.status(200).json(response.data))
        .catch(err => res.status(404).json({ message: `Author not found (${author})` }));
});
// called by axios: (book details based on author)
public_users.get('/async/author/:author', (req, res) => {
    try {
        const author = req.params.author;

        const booksArray = booksToArray(books);
        const booksByAuthor = booksArray.filter(b => b.author === author);

        if (booksByAuthor.length > 0) res.status(200).json(booksByAuthor);
        else res.status(404).json({ message: `Author not found (${title})` });
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});


const doesExist = (username) => users.find(u => u.username === username) !== undefined;

// registered first
public_users.post("/register", (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (!username) return res.status(404).json({ message: "Please provide a username!" });
        if (!password) return res.status(404).json({ message: "Please provide a password!" });
        if (doesExist(username)) return res.status(404).json({ message: `The username (${username}) already exists!` });

        users.push({ "username": username, "password": password });

        return res.status(200).json({ message: `User (${username}) successfully registered. Now you can login` });
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});

const findReviewsByISBN = async (isbn) => {
    const book = books[isbn];

    return book ? book.reviews : null;
};

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const reviews = await findReviewsByISBN(isbn);

        if (reviews !== null) return res.status(200).json(reviews);
        else return res.status(404).json({ message: "Unable to find book by ISBN" });
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});

module.exports.general = public_users;

