const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => users.find( u => u.username) !== undefined;

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
    if (doesExist(username)) return res.status(404).json({ message: "The username already exists!" });

    users.push({ "username": username, "password": password });

    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const entries = Object.entries(books);
    const listOfBooksWithISBN = entries.map( ([k,v]) => ({...v, ISBN: k}))
    //
    // considering 1..10 as "dummy ISBNs" even they are not
    //
    return res.status(200).send(JSON.stringify(listOfBooksWithISBN, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify({...book, ISBN: isbn}, null, 4));
    } else {
        return res.status(404).json({message: "Unable to find book by ISBN"});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    const matches = Object.entries(books).filter( ([k,v]) => v.author === author);
    const booksWithISBN = matches.map( ([k,v]) => ({...v, ISBN: k}));

    if (booksWithISBN.length > 0) {
        return res.status(200).send(JSON.stringify(booksWithISBN, null, 4));
    } else {
        return res.status(404).json({message: "Unable to find book(s) by author"});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    const matches = Object.entries(books).filter( ([k,v]) => v.title === title);
    const booksWithISBN = matches.map( ([k,v]) => ({...v, ISBN: k}));

    if (booksWithISBN.length > 0) {
        return res.status(200).send(JSON.stringify(booksWithISBN, null, 4));
    } else {
        return res.status(404).json({message: "Unable to find book(s) by title"});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        const reviews = Object.values(book.reviews);
        //
        return res.status(200).send(JSON.stringify(reviews, null, 4));
    } else {
        return res.status(404).json({message: "Unable to find book by ISBN"});
    }
});

module.exports.general = public_users;
module.exports.authenticatedUser = authenticatedUser;

