// Import required modules
const express = require('express'); // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const path = require('path'); // Utility for working with file and directory paths
const swaggerJsdoc = require('swagger-jsdoc'); // Swagger documentation generator
const swaggerUi = require('swagger-ui-express'); // Swagger UI middleware for Express

// Initialize Express app and define the port
const app = express();
const PORT = 3000;

// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
app.use(express.json()); // Parse incoming JSON requests

// Function to connect to MongoDB with retry logic
const connectWithRetry = async () =>
{
    try
    {
        // Attempt to connect to MongoDB
        await mongoose.connect('mongodb://admin:password@mongodb:27017/quiz_db?authSource=admin');
        console.log('Connected to MongoDB for Question Service');
    } catch (err)
    {
        // Log connection error and retry after 5 seconds
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Establish MongoDB connection
connectWithRetry();

// Define Mongoose schema and model for questions
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true }, // Question text
    answers: [
        {
            text: { type: String, required: true }, // Answer text
            isCorrect: { type: Boolean, required: true } // Indicates if the answer is correct
        }
    ],
    category: { type: String, required: true } // Category of the question
});
const Question = mongoose.model('Question', questionSchema); // Create the Question model

// Swagger documentation setup
const swaggerOptions = {
    definition: {
        openapi: "3.0.0", // OpenAPI version
        info: {
            title: "Quiz API - Question Service", // API title
            version: "1.0.0", // API version
            description: "API for fetching quiz questions and categories", // API description
        },
        servers: [{ url: "http://localhost:3000", description: "Local server" }] // Server information
    },
    apis: ["./question_server.js"] // Path to API documentation
};
const swaggerDocs = swaggerJsdoc(swaggerOptions); // Generate Swagger docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Serve Swagger UI at /docs

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
// Endpoint to fetch all unique categories
app.get('/categories', async (req, res) =>
{
    try
    {
        const categories = await Question.distinct('category'); // Fetch unique categories
        res.json(categories); // Send categories as JSON response
    } catch (error)
    {
        console.error("Failed to fetch categories:", error);
        res.status(500).json({ error: 'Failed to fetch categories' }); // Handle errors
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
// Endpoint to fetch random quiz questions by category
app.get('/question/:category', async (req, res) =>
{
    const { category } = req.params; // Extract category from path parameters
    const count = parseInt(req.query.count) || 1; // Get count from query parameters, default to 1

    try
    {
        // Fetch random questions from the specified category
        const questions = await Question.aggregate([
            { $match: { category } }, // Match questions by category
            { $sample: { size: count } } // Randomly sample the specified number of questions
        ]);

        if (questions.length === 0)
        {
            return res.status(404).json({ error: 'No questions found for this category' }); // Handle no questions found
        }

        // Format questions to shuffle answers and include the correct answer
        const formattedQuestions = questions.map(question =>
        {
            const shuffledAnswers = question.answers
                .map(answer => ({ ...answer })) // Clone answers
                .sort(() => Math.random() - 0.5); // Shuffle answers

            return {
                question: question.question, // Question text
                answers: shuffledAnswers.map(ans => ans.text), // Send only answer text for UI
                correctAnswer: shuffledAnswers.find(ans => ans.isCorrect)?.text, // Find correct answer
                category: question.category // Question category
            };
        });

        res.json(formattedQuestions); // Send formatted questions as JSON response

    } catch (error)
    {
        console.error("Failed to fetch random questions:", error);
        res.status(500).json({ error: 'Failed to fetch random questions' }); // Handle errors
    }
});

// Serve the index.html file for the root route
app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the index.html file
});

// Start the server and listen on the specified port
app.listen(PORT, () =>
{
    console.log(`Question Service running at http://localhost:${PORT}`); // Log server start message
});