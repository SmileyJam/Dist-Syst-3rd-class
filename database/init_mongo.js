db = connect("mongodb://admin:password@localhost:27017/admin");

db = db.getSiblingDB('quiz_db');

// Drop existing collection to avoid duplicates
db.questions.drop();

// Create collection
db.createCollection('questions');

// Insert new formatted questions
db.questions.insertMany([
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Paris", isCorrect: true },
            { text: "London", isCorrect: false },
            { text: "Berlin", isCorrect: false },
            { text: "Madrid", isCorrect: false }
        ],
        category: "Geography"
    },
    {
        question: "What is 5 + 3?",
        answers: [
            { text: "8", isCorrect: true },
            { text: "9", isCorrect: false },
            { text: "7", isCorrect: false },
            { text: "10", isCorrect: false }
        ],
        category: "Mathematics"
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        answers: [
            { text: "William Shakespeare", isCorrect: true },
            { text: "Charles Dickens", isCorrect: false },
            { text: "Jane Austen", isCorrect: false },
            { text: "Mark Twain", isCorrect: false }
        ],
        category: "Literature"
    },
    {
        question: "What is the chemical symbol for water?",
        answers: [
            { text: "H2O", isCorrect: true },
            { text: "CO2", isCorrect: false },
            { text: "O2", isCorrect: false },
            { text: "H2", isCorrect: false }
        ],
        category: "Science"
    }
]);

print("✅ Database seeded successfully with new question format!");
