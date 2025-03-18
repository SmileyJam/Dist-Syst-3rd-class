const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3200;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const connectWithRetry = async () => {
    try {
        await mongoose.connect('mongodb://admin:password@mongodb:27017/quiz_db?authSource=admin');
        console.log('Connected to MongoDB for Submit Service');
    } catch (err) {
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
            title: "Quiz API - Submit Service",
            version: "1.0.0",
            description: "API for submitting quiz questions and retrieving categories",
        },
        servers: [{ url: "http://localhost:3200", description: "Local server" }]
    },
    apis: ["./submit_server.js"]
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all unique categories
 *     tags: [Submit Service]
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
 * /submit:
 *   post:
 *     summary: Submit a new quiz question
 *     tags: [Submit Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               category:
 *                 type: string
 *               newCategory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully submitted question
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
app.post('/submit', async (req, res) =>
{
    const { question, answers, category, newCategory } = req.body;

    console.log("Incoming Submission:", { question, answers, category, newCategory });

    // Validate inputs
    if (!question || !answers || answers.length !== 4 || (!category && !newCategory))
    {
        console.log("Validation Failed: Missing required fields.");
        return res.status(400).json({ error: 'All fields are required and exactly 4 answers must be provided.' });
    }

    // Ensure exactly one correct answer
    const correctAnswerCount = answers.filter(ans => ans.isCorrect).length;
    if (correctAnswerCount !== 1)
    {
        console.log("Validation Failed: There must be exactly one correct answer.");
        return res.status(400).json({ error: 'Please select exactly one correct answer.' });
    }

    // Ensure answers remain as objects (text + isCorrect) and not strings
    const formattedAnswers = answers.map(ans => ({
        text: ans.text,
        isCorrect: ans.isCorrect
    }));

    const chosenCategory = newCategory.trim() !== '' ? newCategory : category;

    console.log("Prepared for DB Save:", { question, formattedAnswers, category: chosenCategory });

    try
    {
        // Prevent duplicate categories
        if (newCategory)
        {
            const existingCategories = await Question.distinct('category');
            if (existingCategories.includes(newCategory))
            {
                console.log("Category already exists. Using existing category.");
            }
        }

        const newQuestion = new Question({
            question,
            answers: formattedAnswers,
            category: chosenCategory
        });

        // Save to database
        const savedQuestion = await newQuestion.save();
        console.log("Successfully Saved to DB:", savedQuestion);

        res.json({ message: 'Question submitted successfully!', savedQuestion });

    } catch (error)
    {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Failed to submit question' });
    }
});

// Serve the submit.html file
app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'public', 'submit.html'));
});

// Start the server
app.listen(PORT, () =>
{
    console.log(`Submit Service running at http://localhost:${PORT}`);
});