// Import required modules
const express = require('express'); // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const path = require('path'); // Utility for working with file and directory paths
const swaggerUi = require('swagger-ui-express'); // Middleware to serve Swagger UI
const swaggerJsdoc = require('swagger-jsdoc'); // Tool to generate Swagger documentation
const amqp = require('amqplib'); // RabbitMQ library for Node.js

// Initialize Express app and define the port
const app = express();
const PORT = 3200;

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
app.use(express.json()); // Parse incoming JSON requests

// Function to connect to MongoDB with retry logic
const connectWithRetry = async () => {
    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect('mongodb://admin:password@mongodb:27017/quiz_db?authSource=admin');
        console.log('Connected to MongoDB for Submit Service');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
    }
};

// Establish MongoDB connection
connectWithRetry();

// Define Mongoose schema and model for quiz questions
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true }, // Question text
    answers: [ // Array of answer objects
        {
            text: { type: String, required: true }, // Answer text
            isCorrect: { type: Boolean, required: true } // Whether the answer is correct
        }
    ],
    category: { type: String, required: true } // Category of the question
});

// Create a Mongoose model for the questions
const Question = mongoose.model('Question', questionSchema);

// RabbitMQ connection setup
let channel;
const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://rabbitmq'); // Connect to RabbitMQ
        channel = await connection.createChannel(); // Create a channel
        await channel.assertQueue('SUBMITTED_QUESTIONS', { durable: true }); // Ensure the queue exists
        console.log('Connected to RabbitMQ and queue is ready.');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); // Retry connection after 5 seconds
    }
};

// Establish RabbitMQ connection
connectRabbitMQ();

// Swagger Documentation setup
const swaggerOptions = {
    definition: {
        openapi: "3.0.0", // OpenAPI version
        info: {
            title: "Quiz API - Submit Service", // API title
            version: "1.0.0", // API version
            description: "API for submitting quiz questions and retrieving categories", // API description
        },
        servers: [{ url: "http://localhost:3200", description: "Local server" }] // Server information
    },
    apis: ["./submit_server.js"] // Path to API documentation
};
const swaggerDocs = swaggerJsdoc(swaggerOptions); // Generate Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Serve Swagger UI at /docs

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
// Endpoint to fetch all unique categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await Question.distinct('category'); // Fetch unique categories from the database
        res.json(categories); // Send categories as JSON response
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        res.status(500).json({ error: 'Failed to fetch categories' }); // Handle errors
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
// Endpoint to submit a new quiz question
app.post('/submit', async (req, res) => {
    const { question, answers, category, newCategory } = req.body; // Extract data from request body

    console.log("Incoming Submission:", { question, answers, category, newCategory });

    // Validate inputs
    if (!question || !answers || answers.length !== 4 || (!category && !newCategory)) {
        console.log("Validation Failed: Missing required fields.");
        return res.status(400).json({ error: 'All fields are required and exactly 4 answers must be provided.' });
    }

    // Ensure exactly one correct answer
    const correctAnswerCount = answers.filter(ans => ans.isCorrect).length;
    if (correctAnswerCount !== 1) {
        console.log("Validation Failed: There must be exactly one correct answer.");
        return res.status(400).json({ error: 'Please select exactly one correct answer.' });
    }

    // Format answers to ensure they remain objects with text and isCorrect properties
    const formattedAnswers = answers.map(ans => ({
        text: ans.text,
        isCorrect: ans.isCorrect
    }));

    // Determine the category to use (newCategory takes precedence if provided)
    const chosenCategory = newCategory.trim() !== '' ? newCategory : category;

    console.log("Prepared for DB Save:", { question, formattedAnswers, category: chosenCategory });

    try {
        // Prevent duplicate categories
        if (newCategory) {
            const existingCategories = await Question.distinct('category'); // Fetch existing categories
            if (existingCategories.includes(newCategory)) {
                console.log("Category already exists. Using existing category.");
            }
        }

        // Publish the question to RabbitMQ
        const message = {
            question,
            answers: formattedAnswers,
            category: chosenCategory
        };
        channel.sendToQueue('SUBMITTED_QUESTIONS', Buffer.from(JSON.stringify(message)));
        console.log("Message published to RabbitMQ:", message);

        // Send success response
        res.json({ message: 'Question submitted successfully!' });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Failed to submit question' }); // Handle errors
    }
});

// Serve the submit.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'submit.html')); // Serve the HTML file
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Submit Service running at http://localhost:${PORT}`);
});