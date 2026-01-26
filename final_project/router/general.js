const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const getBooksSync = () => books;   // sync access to books, used by the 'internal' route
public_users.get('/internal/books-sync', (req, res) => res.status(200).json(getBooksSync())); // service url for axios

//
const getBooksAsync = async () => {
    try {
      return await axios.get("http://localhost:5000/internal/books-sync").then( r => r.data).then(booksToArray)
    } catch (error) {
      console.error(error);
      throw error; // bubbling up error to be handled by the request handlers .catch()
    }
}

const booksToArray = (obj) => {
    const wrapISBN = ([isbn, book]) => ({ ...book, ISBN: String(isbn) });

    return Object.entries(obj).map(wrapISBN);
}

// Get the book list available in the shop
public_users.get('/', (req, res) => getBooksAsync()
    .then(booksToArray)
    .then( (arr) => res.status(200).json(arr))
    .catch((err) => res.status(500).json({ message: "Error during processing your request" })));
    

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    return getBooksAsync()
        .then(booksToArray)
        .then( (arr) => arr.find( b => b.ISBN === req.params.isbn) )
        .then( (book) => (book) ? 
            res.status(200).json(book) :
            res.status(404).json({ message: "Unable to find book by ISBN" })
        ).catch( (err) => res.status(500).json({ message: "Error during processing your request" }))
});

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    return getBooksAsync()
        .then(booksToArray)
        .then( (arr) => arr.filter( b => b.author === req.params.author) )
        .then( (booksMatchingAuthor) => (booksMatchingAuthor.length > 0) ? 
            res.status(200).json(booksMatchingAuthor) :
            res.status(404).json({ message:  "Unable to find book(s) by author" })
        ).catch( (err) => res.status(500).json({ message: "Error during processing your request" }))
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    return getBooksAsync()
        .then(booksToArray)
        .then( (arr) => arr.filter( b => b.title === req.params.title) )
        .then( (booksMatchingTitle) => (booksMatchingTitle.length > 0) ? 
            res.status(200).json(booksMatchingTitle) :
            res.status(404).json({ message:  "Unable to find book(s) by title" })
        ).catch( (err) => res.status(500).json({ message: "Error during processing your request" }))
});


const doesExist = (username) => users.find( u => u.username === username) !== undefined;

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
      });
      return validusers.length > 0;
}


// registered first
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) return res.status(404).json({ message: "Please provide a username!" });
    if (!password) return res.status(404).json({ message: "Please provide a password!" });
    if (doesExist(username)) return res.status(404).json({ message: `The username (${username}) already exists!` });

    users.push({ "username": username, "password": password });

    return res.status(200).json({ message: `User (${username}) successfully registered. Now you can login` });
});


const findReviewsByISBN = async (isbn) => {
    const book = books[isbn];

    return book ? book.reviews : null;
};

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    try {
      const isbn = req.params.isbn;
      const reviews = await findReviewsByISBN(isbn);
  
      if (reviews !== null) {
        return res.status(200).json(reviews);
      } else {
        return res.status(404).json({ message: "Unable to find book by ISBN" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Error during processing your request" });
    }
});

module.exports.general = public_users;

