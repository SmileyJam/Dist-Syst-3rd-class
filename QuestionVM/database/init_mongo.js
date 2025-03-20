db = connect("mongodb://admin:password@localhost:27017/admin");

db = db.getSiblingDB('quiz_db');

// Drop existing collection to avoid duplicates
db.questions.drop();

// Create collection
db.createCollection('questions');

// Insert new formatted questions
db.questions.insertMany([
    // Geography
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
        question: "Which continent is the Sahara Desert located in?",
        answers: [
            { text: "Africa", isCorrect: true },
            { text: "Asia", isCorrect: false },
            { text: "Australia", isCorrect: false },
            { text: "South America", isCorrect: false }
        ],
        category: "Geography"
    },
    {
        question: "Mount Everest is part of which mountain range?",
        answers: [
            { text: "Himalayas", isCorrect: true },
            { text: "Rockies", isCorrect: false },
            { text: "Andes", isCorrect: false },
            { text: "Alps", isCorrect: false }
        ],
        category: "Geography"
    },
    {
        question: "What is the largest ocean on Earth?",
        answers: [
            { text: "Pacific Ocean", isCorrect: true },
            { text: "Atlantic Ocean", isCorrect: false },
            { text: "Indian Ocean", isCorrect: false },
            { text: "Arctic Ocean", isCorrect: false }
        ],
        category: "Geography"
    },
    {
        question: "Which country has the most natural lakes?",
        answers: [
            { text: "Canada", isCorrect: true },
            { text: "Russia", isCorrect: false },
            { text: "USA", isCorrect: false },
            { text: "Brazil", isCorrect: false }
        ],
        category: "Geography"
    },

    // Mathematics
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
        question: "What is the square root of 16?",
        answers: [
            { text: "4", isCorrect: true },
            { text: "5", isCorrect: false },
            { text: "6", isCorrect: false },
            { text: "3", isCorrect: false }
        ],
        category: "Mathematics"
    },
    {
        question: "What is 10 multiplied by 2?",
        answers: [
            { text: "20", isCorrect: true },
            { text: "15", isCorrect: false },
            { text: "25", isCorrect: false },
            { text: "30", isCorrect: false }
        ],
        category: "Mathematics"
    },
    {
        question: "What is 100 divided by 5?",
        answers: [
            { text: "20", isCorrect: true },
            { text: "25", isCorrect: false },
            { text: "15", isCorrect: false },
            { text: "10", isCorrect: false }
        ],
        category: "Mathematics"
    },
    {
        question: "What is the next prime number after 7?",
        answers: [
            { text: "11", isCorrect: true },
            { text: "9", isCorrect: false },
            { text: "13", isCorrect: false },
            { text: "15", isCorrect: false }
        ],
        category: "Mathematics"
    },

    // Science
    {
        question: "What is the chemical symbol for water?",
        answers: [
            { text: "H2O", isCorrect: true },
            { text: "CO2", isCorrect: false },
            { text: "O2", isCorrect: false },
            { text: "H2", isCorrect: false }
        ],
        category: "Science"
    },
    {
        question: "What planet is known as the Red Planet?",
        answers: [
            { text: "Mars", isCorrect: true },
            { text: "Venus", isCorrect: false },
            { text: "Jupiter", isCorrect: false },
            { text: "Saturn", isCorrect: false }
        ],
        category: "Science"
    },
    {
        question: "What gas do plants absorb from the atmosphere?",
        answers: [
            { text: "Carbon dioxide", isCorrect: true },
            { text: "Oxygen", isCorrect: false },
            { text: "Nitrogen", isCorrect: false },
            { text: "Hydrogen", isCorrect: false }
        ],
        category: "Science"
    },
    {
        question: "What force keeps us on the ground?",
        answers: [
            { text: "Gravity", isCorrect: true },
            { text: "Magnetism", isCorrect: false },
            { text: "Friction", isCorrect: false },
            { text: "Inertia", isCorrect: false }
        ],
        category: "Science"
    },
    {
        question: "Which organ in the human body is responsible for pumping blood?",
        answers: [
            { text: "Heart", isCorrect: true },
            { text: "Lungs", isCorrect: false },
            { text: "Brain", isCorrect: false },
            { text: "Liver", isCorrect: false }
        ],
        category: "Science"
    },
    
        // History
    {
        question: "Who was the first President of the United States?",
        answers: [
            { text: "George Washington", isCorrect: true },
            { text: "Thomas Jefferson", isCorrect: false },
            { text: "Abraham Lincoln", isCorrect: false },
            { text: "John Adams", isCorrect: false }
        ],
        category: "History"
    },
    {
        question: "What year did World War II end?",
        answers: [
            { text: "1945", isCorrect: true },
            { text: "1939", isCorrect: false },
            { text: "1918", isCorrect: false },
            { text: "1950", isCorrect: false }
        ],
        category: "History"
    },
    {
        question: "Who discovered America?",
        answers: [
            { text: "Christopher Columbus", isCorrect: true },
            { text: "Marco Polo", isCorrect: false },
            { text: "Vasco da Gama", isCorrect: false },
            { text: "James Cook", isCorrect: false }
        ],
        category: "History"
    },
    {
        question: "What was the name of the ship that carried the Pilgrims to America in 1620?",
        answers: [
            { text: "Mayflower", isCorrect: true },
            { text: "Santa Maria", isCorrect: false },
            { text: "Endeavour", isCorrect: false },
            { text: "Beagle", isCorrect: false }
        ],
        category: "History"
    },
    {
        question: "Which ancient civilization built the pyramids?",
        answers: [
            { text: "Egyptians", isCorrect: true },
            { text: "Romans", isCorrect: false },
            { text: "Greeks", isCorrect: false },
            { text: "Mayans", isCorrect: false }
        ],
        category: "History"
    },

    // Technology
    {
        question: "Who is known as the father of the computer?",
        answers: [
            { text: "Charles Babbage", isCorrect: true },
            { text: "Alan Turing", isCorrect: false },
            { text: "Steve Jobs", isCorrect: false },
            { text: "Bill Gates", isCorrect: false }
        ],
        category: "Technology"
    },
    {
        question: "What does CPU stand for?",
        answers: [
            { text: "Central Processing Unit", isCorrect: true },
            { text: "Computer Processing Unit", isCorrect: false },
            { text: "Central Performance Utility", isCorrect: false },
            { text: "Core Processing Unit", isCorrect: false }
        ],
        category: "Technology"
    },
    {
        question: "What year was the first iPhone released?",
        answers: [
            { text: "2007", isCorrect: true },
            { text: "2005", isCorrect: false },
            { text: "2010", isCorrect: false },
            { text: "2012", isCorrect: false }
        ],
        category: "Technology"
    },
    {
        question: "Which programming language is primarily used for web development?",
        answers: [
            { text: "JavaScript", isCorrect: true },
            { text: "Python", isCorrect: false },
            { text: "C++", isCorrect: false },
            { text: "Java", isCorrect: false }
        ],
        category: "Technology"
    },
    {
        question: "What does HTML stand for?",
        answers: [
            { text: "HyperText Markup Language", isCorrect: true },
            { text: "Hyperlink Text Management Language", isCorrect: false },
            { text: "High Tech Machine Learning", isCorrect: false },
            { text: "HyperText Modern Language", isCorrect: false }
        ],
        category: "Technology"
    }
]);

print("Database seeded successfully with new question format!");
