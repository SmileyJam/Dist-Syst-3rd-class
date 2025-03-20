const amqp = require('amqplib');
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://my_mongo_db:27017/quiz_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Question = mongoose.model('Question', {
  category: String,
  question: String,
  answers: [String],
  correctAnswer: String,
});

async function startETL() {
  const connection = await amqp.connect('amqp://rabbitmq');
  const channel = await connection.createChannel();
  const queue = 'SUBMITTED_QUESTIONS';

  await channel.assertQueue(queue, { durable: true });

  console.log('Waiting for messages in %s...', queue);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('Received:', data);

      // Transform and load into MongoDB
      const { category, question, answers, correctAnswer } = data;
      await Question.create({ category, question, answers, correctAnswer });

      channel.ack(msg);
    }
  });
}

startETL().catch(console.error);