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
    if (doesExist(username)) return res.status(404).json({ message: `The username (${username}) already exists!` });

    users.push({ "username": username, "password": password });

    return res.status(200).json({ message: `User (${username}) successfully registered. Now you can login` });
});

const listAllBooks = async () => {
    return Object.entries(books).map(([isbn, book]) => ({
        ...book,
        ISBN: String(isbn),
    }));
};

const findBookByISBN = async (isbn) => {
    const book = books[isbn];
    return book ? { ...book, ISBN: String(isbn) } : null;
};

const findBooksByAuthor = async (author) => {
    return Object.entries(books)
        .filter(
        ([, book]) =>
            book.author === author
        )
        .map(([isbn, book]) => ({ ...book, ISBN: String(isbn) }));
};

const findBooksByTitle = async (title) => {
    return Object.entries(books)
        .filter(
        ([, book]) => book.title === title
        )
        .map(([isbn, book]) => ({ ...book, ISBN: String(isbn) }));
};

const findReviewsByISBN = async (isbn) => {
    const book = books[isbn];

    return book ? book.reviews : null;
};

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const books = await listAllBooks(); // non blocking data access
    
        return res.status(200).json(books); 
    } catch (err) {
        return res.status(500).json({ message: "Error during processing your request" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
      const book = await findBookByISBN(isbn);
  
      if (book) {
        return res.status(200).json(book);
      } else {
        return res.status(404).json({ message: "Unable to find book by ISBN" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Error during processing your request" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    try {
      const author = req.params.author;
      const books = await findBooksByAuthor(author);
  
      if (books.length > 0) {
        return res.status(200).json(books);
      } else {
        return res.status(404).json({ message: "Unable to find book(s) by author" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Error during processing your request" });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try {
      const title = req.params.title;
      const books = await findBooksByTitle(title);
  
      if (books) {
        return res.status(200).json(books);
      } else {
        return res.status(404).json({ message: "Unable to find book(s) by title" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Error during processing your request" });
    }
});

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
module.exports.authenticatedUser = authenticatedUser;

