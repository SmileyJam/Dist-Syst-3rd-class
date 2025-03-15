db = connect("mongodb://mongo:27017/quizdb-mongo");

// Example questions
const exampleQuestions = [
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
];

// Insert questions only if they don't already exist
exampleQuestions.forEach(question =>
{
    const exists = db.questions.findOne({ question: question.question });
    if (!exists)
    {
        db.questions.insertOne(question);
        print(`Inserted question: ${question.question}`);
    } else
    {
        print(`Question already exists: ${question.question}`);
    }
});
