const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const connectWithRetry = async () =>
{
    try
    {
        await mongoose.connect('mongodb://admin:password@mongodb:27017/quiz_db?authSource=admin');
        console.log('Connected to MongoDB for Question Service');
    } catch (err)
    {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

connectWithRetry();

// Define Mongoose schema and model
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }
    ],
    category: { type: String, required: true }
});
const Question = mongoose.model('Question', questionSchema);

// Swagger Documentation
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Quiz API - Question Service",
            version: "1.0.0",
            description: "API for fetching quiz questions and categories",
        },
        servers: [{ url: "http://localhost:3000", description: "Local server" }]
    },
    apis: ["./question_server.js"]
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all unique categories
 *     tags: [Question Service]
 *     responses:
 *       200:
 *         description: A list of unique categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/categories', async (req, res) =>
{
    try
    {
        const categories = await Question.distinct('category');
        res.json(categories);
    } catch (error)
    {
        console.error("Failed to fetch categories:", error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

/**
 * @swagger
 * /question/{category}:
 *   get:
 *     summary: Get random quiz questions by category
 *     tags: [Question Service]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: The category of the question
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The number of questions to return
 *     responses:
 *       200:
 *         description: A list of random quiz questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                   answers:
 *                     type: array
 *                     items:
 *                       type: string
 *                   correctAnswer:
 *                     type: string
 *                   category:
 *                     type: string
 *       404:
 *         description: No questions found for this category
 *       500:
 *         description: Internal server error
 */
app.get('/question/:category', async (req, res) =>
{
    const { category } = req.params;
    const count = parseInt(req.query.count) || 1;

    try
    {
        // Fetch random questions from the specified category
        const questions = await Question.aggregate([
            { $match: { category } },
            { $sample: { size: count } }
        ]);

        if (questions.length === 0)
        {
            return res.status(404).json({ error: 'No questions found for this category' });
        }

        // Ensure answers are shuffled while keeping track of correct answer
        const formattedQuestions = questions.map(question =>
        {
            const shuffledAnswers = question.answers
                .map(answer => ({ ...answer }))
                .sort(() => Math.random() - 0.5);

            return {
                question: question.question,
                answers: shuffledAnswers.map(ans => ans.text), // Send only answer text for UI
                correctAnswer: shuffledAnswers.find(ans => ans.isCorrect)?.text, // Find correct answer
                category: question.category
            };
        });

        res.json(formattedQuestions);

    } catch (error)
    {
        console.error("Failed to fetch random questions:", error);
        res.status(500).json({ error: 'Failed to fetch random questions' });
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