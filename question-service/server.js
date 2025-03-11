const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
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

// Endpoint to fetch questions by category
app.get('/question/:category', async (req, res) =>
{
    const { category } = req.params;
    const count = parseInt(req.query.count) || 1;

    try
    {
        const questions = await Question.find({ category }).limit(count);
        if (questions.length === 0)
        {
            return res.status(404).json({ error: 'No questions found for this category' });
        }

        // Shuffle answers for each question
        const shuffledQuestions = questions.map(q => ({
            ...q._doc,
            answers: q.answers.sort(() => Math.random() - 0.5)
        }));

        res.json(shuffledQuestions);
    } catch (error)
    {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Start the server
app.listen(PORT, () =>
{
    console.log(`Question Service running at http://localhost:${PORT}`);
});
