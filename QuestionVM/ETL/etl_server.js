const amqp = require('amqplib');
const mongoose = require('mongoose');

const RMQ_HOST = process.env.RMQ_HOST || 'rabbitmq';
const RMQ_USER = process.env.RMQ_USER || 'admin';
const RMQ_PASS = process.env.RMQ_PASS || 'admin';
const QUEUE_NAME = 'SUBMITTED_QUESTIONS';

let connection, channel;

// MongoDB setup
mongoose.connect('mongodb://admin:password@mongodb:27017/quiz_db?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err =>
  {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const questionSchema = new mongoose.Schema({
  question: String,
  answers: [
    { text: String, isCorrect: Boolean }
  ],
  category: String
});
const Question = mongoose.model('Question', questionSchema);

async function connectToQueue()
{
  const uri = `amqp://${RMQ_USER}:${RMQ_PASS}@${RMQ_HOST}:5672/`;
  try
  {
    connection = await amqp.connect(uri);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`ETL connected to RabbitMQ at ${RMQ_HOST} on queue "${QUEUE_NAME}"`);
    listenForMessages();
  } catch (error)
  {
    console.error('RabbitMQ connection failed:', error);
    process.exit(1);
  }
}

function listenForMessages()
{
  channel.consume(QUEUE_NAME, async (msg) =>
  {
    if (msg !== null)
    {
      try
      {
        const data = JSON.parse(msg.content.toString());
        console.log('Received from queue:', data);

        const { question, category, answers } = data;

        await Question.create({ question, category, answers });

        channel.ack(msg);
      } catch (err)
      {
        console.error('Failed to insert into MongoDB:', err);
        channel.nack(msg); // Retry if needed
      }
    }
  });
}

connectToQueue();
