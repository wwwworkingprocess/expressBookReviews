const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = (req.body.review || '').trim();

    if (!username) return res.status(403).json({ message: "Your session has expired!" });
    if (!isbn) return res.status(404).json({ message: "Please provide a valid ISBN!" });
    if (!review) return res.status(404).json({ message: "Please provide a review" });

    const bookByISBN = books[isbn];

    if (!bookByISBN) return res.status(404).json({message: "Unable to find book by ISBN"});

    const currentReviews = bookByISBN.reviews;
    const alreadyExists = Object.keys(currentReviews).includes(username);
   
    // apply change (mutate)
    currentReviews[username] = review;

    if (alreadyExists) return res.status(200).json({message: "You successfuly updated your review!"});

    return res.status(201).json({message: "Your review has been saved."});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    if (!username) return res.status(403).json({ message: "Your session has expired!" });
    if (!isbn) return res.status(404).json({ message: "Please provide a valid ISBN!" });

    const bookByISBN = books[isbn];

    if (!bookByISBN) return res.status(404).json({message: "Unable to find book by ISBN"});

    const currentReviews = bookByISBN.reviews;
    const reviewExists = Object.keys(currentReviews).includes(username);

    if (reviewExists) {
        // apply change (mutate)
        delete currentReviews[username];

        return res.status(202).json({message: "Your review has been deleted successfuly!"});
    } else {
        return res.status(404).json({message: "You have no review to delete."});
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
