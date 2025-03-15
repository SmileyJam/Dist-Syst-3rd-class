db = connect("mongodb://admin:password@localhost:27017/admin");

db = db.getSiblingDB('quiz_db');

db.createCollection('questions');

db.questions.insertMany([
    {
        question: "What is the capital of France?",
        answers: ["Paris", "London", "Berlin", "Madrid"],
        correctAnswer: "Paris",
        category: "Geography"
    },
    {
        question: "What is 5 + 3?",
        answers: ["8", "9", "7", "10"],
        correctAnswer: "8",
        category: "Mathematics"
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        answers: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"],
        correctAnswer: "William Shakespeare",
        category: "Literature"
    },
    {
        question: "What is the chemical symbol for water?",
        answers: ["H2O", "CO2", "O2", "H2"],
        correctAnswer: "H2O",
        category: "Science"
    }
]);
