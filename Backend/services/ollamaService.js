const axios = require('axios');

// Smart fallback knowledge base for when Ollama is offline
const knowledgeBase = {
  "what is ai": "Artificial Intelligence (AI) is the simulation of human intelligence by computer systems. It includes learning, reasoning, problem-solving, perception, and language understanding. AI is used in virtual assistants, self-driving cars, medical diagnosis, and much more.",
  "what is machine learning": "Machine Learning (ML) is a subset of AI where systems learn from data and improve over time without being explicitly programmed. It uses algorithms to identify patterns in data. Types include supervised learning, unsupervised learning, and reinforcement learning.",
  "what is deep learning": "Deep Learning is a subset of Machine Learning that uses neural networks with many layers (hence 'deep') to model complex patterns in data. It powers image recognition, natural language processing, and generative AI like ChatGPT.",
  "what is python": "Python is a high-level, interpreted programming language known for its simple syntax and readability. It's widely used in web development, data science, machine learning, automation, and scripting.",
  "what is javascript": "JavaScript is a versatile programming language primarily used for web development. It runs in browsers to make websites interactive and can also run on servers using Node.js.",
  "what is react": "React is a popular JavaScript library created by Facebook for building user interfaces. It uses a component-based architecture and a virtual DOM for efficient rendering.",
  "what is nodejs": "Node.js is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server side. It's used for building scalable network applications.",
  "what is mongodb": "MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents. It's designed for scalability and developer productivity.",
  "what is an api": "An API (Application Programming Interface) is a set of rules that allows different software applications to communicate with each other. REST APIs use HTTP methods like GET, POST, PUT, and DELETE.",
  "what is cybersecurity": "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. It includes areas like network security, application security, information security, and disaster recovery.",
  "what is prompt injection": "Prompt injection is a security vulnerability in AI/LLM systems where an attacker crafts input to manipulate the AI into ignoring its instructions or revealing sensitive information. It's similar to SQL injection but for AI models.",
  "what is a firewall": "A firewall is a network security device that monitors and filters incoming and outgoing network traffic based on security rules. It acts as a barrier between trusted and untrusted networks.",
  "what is html": "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using elements like headings, paragraphs, links, and images.",
  "what is css": "CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of HTML documents. It controls layout, colors, fonts, and responsive design.",
  "what is sql": "SQL (Structured Query Language) is a programming language used to manage and query relational databases. Common commands include SELECT, INSERT, UPDATE, and DELETE.",
  "what is git": "Git is a distributed version control system that tracks changes in source code during software development. It allows multiple developers to collaborate efficiently.",
  "what is cloud computing": "Cloud computing delivers computing services (servers, storage, databases, networking, software) over the internet. Major providers include AWS, Azure, and Google Cloud Platform.",
  "what is docker": "Docker is a platform that uses containerization to package applications and their dependencies into portable containers. Containers are lightweight, consistent, and run anywhere.",
  "what is blockchain": "Blockchain is a decentralized, distributed digital ledger that records transactions across many computers. It's the technology behind cryptocurrencies and has applications in supply chain, healthcare, and more.",
};

const getSmartFallback = (prompt) => {
  const promptLower = prompt.toLowerCase().trim();

  // Try exact/partial match from knowledge base
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    if (promptLower.includes(key) || key.includes(promptLower)) {
      return answer;
    }
  }

  // Greeting responses
  const greetings = ['hi', 'hello', 'hey', 'hii', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon'];
  for (const g of greetings) {
    if (promptLower.startsWith(g)) {
      return "Hi! It's nice to meet you. Is there something I can help you with, or would you like to chat?";
    }
  }

  // How are you
  if (promptLower.includes('how are you') || promptLower.includes('how r u') || promptLower.includes('how are u')) {
    return "I'm doing great, thank you for asking! How can I help you today?";
  }

  // Thank you
  if (promptLower.includes('thank') || promptLower.includes('thnx') || promptLower.includes('thx')) {
    return "You're welcome! Feel free to ask me anything else.";
  }

  // Generic helpful response
  return `That's a great question! I'd love to help you with "${prompt}". While my full AI model (Ollama) is currently offline, the AI Firewall has verified your prompt as safe. Once the LLM is connected, you'll get detailed, context-aware responses.\n\nTo enable full AI responses, start Ollama with: \`ollama serve\``;
};

const generateResponse = async (prompt) => {
  try {
    // Check if Ollama is running
    await axios.get(`${process.env.OLLAMA_URL}`, { timeout: 3000 });

    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      {
        model: 'llama3',
        prompt: prompt,
        stream: false,
      },
      { timeout: 60000 }
    );

    return response.data.response;
  } catch (error) {
    console.log('⚠️ Ollama offline — using smart fallback');
    return getSmartFallback(prompt);
  }
};

module.exports = { generateResponse };