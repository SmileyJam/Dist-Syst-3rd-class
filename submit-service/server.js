const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/quizdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schema and model
const questionSchema = new mongoose.Schema({
    question: String,
    answers: [String],
    correctAnswer: String,
    category: String
});
const Question = mongoose.model('Question', questionSchema);

// Endpoint to fetch categories
app.get('/categories', async (req, res) =>
{
    try
    {
        const categories = await Question.distinct('category'); // Get unique categories
        res.json(categories);
    } catch (error)
    {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Endpoint to submit a new question
app.post('/submit', async (req, res) =>
{
    const { question, answers, correctAnswer, category, newCategory } = req.body;

    if (!question || !answers || answers.length !== 4 || !correctAnswer || (!category && !newCategory))
    {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const chosenCategory = newCategory || category;

    try
    {
        const newQuestion = new Question({ question, answers, correctAnswer, category: chosenCategory });
        await newQuestion.save();
        res.json({ message: 'Question submitted successfully!' });
    } catch (error)
    {
        res.status(500).json({ error: 'Failed to submit question' });
    }
});

// Start the server
app.listen(PORT, () =>
{
    console.log(`Submit Service running at http://localhost:${PORT}`);
});
