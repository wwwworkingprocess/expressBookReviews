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
  
    // You have to give a review as a request query & it must get posted with the username (stored in the session) posted. 
    // If the same user posts a different review on the same ISBN, it should modify the existing review. 
    // If another user logs in and posts a review on the same ISBN, it will get added as a different review under the same ISBN.

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

    if (alreadyExists) return res.status(200).json({message: "You already made a review!"});
   
    // apply change (mutate)
    currentReviews[username] = review;

    return res.status(200).json({message: "Your review has been saved."});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
