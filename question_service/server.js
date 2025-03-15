const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Retry MongoDB connection
const connectWithRetry = async () =>
{
    try
    {
        mongoose.connect('mongodb://admin:password@mongodb:27017/quiz_db?authSource=admin', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connected to MongoDB for Question Service');
    } catch (err)
    {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }
};

// Initialize the connection
connectWithRetry();

// Define Mongoose schema and model
const questionSchema = new mongoose.Schema({
    question: String,
    answers: [String],
    correctAnswer: String,
    category: String
});
const Question = mongoose.model('Question', questionSchema);

// Fetch all unique categories
app.get('/categories', async (req, res) =>
{
    try
    {
        const categories = await Question.distinct('category');
        res.json(categories);
    } catch (error)
    {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Fetch a random question by category
app.get('/question/:category', async (req, res) =>
{
    const { category } = req.params;

    try
    {
        // Fetch one random question from the specified category
        const questions = await Question.aggregate([
            { $match: { category } },     // Match the category
            { $sample: { size: 1 } }      // Randomly sample one document
        ]);

        if (questions.length === 0)
        {
            return res.status(404).json({ error: 'No questions found for this category' });
        }

        // Shuffle answers for the fetched question
        const shuffledQuestion = {
            ...questions[0],
            answers: questions[0].answers.sort(() => Math.random() - 0.5)
        };

        res.json(shuffledQuestion);
    } catch (error)
    {
        res.status(500).json({ error: 'Failed to fetch a random question' });
    }
});

// Serve the index.html file
app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () =>
{
    console.log(`Question Service running at http://localhost:${PORT}`);
});
