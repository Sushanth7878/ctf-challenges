const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Mock environment variables (for CTF purposes)
const mockEnv = {
  FLAG: 'h4cktf1{n44_th0_0chch3d3v4ru_062013}',
  NODE_ENV: 'production',
  USER: 'ctf_user',
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin',
  HOME: '/home/ctf_user',
  SHELL: '/bin/bash',
  PWD: '/var/www/ctf'
};

// Helper functions for the sandbox
const sandboxHelpers = {
  printEnv: () => JSON.stringify(mockEnv, null, 2),
  listEnvKeys: () => Object.keys(mockEnv).join('\n'),
  getEnv: (key) => mockEnv[key]
};

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Function to validate template safety
function validateTemplate(template) {
  const dangerousPatterns = [
    /process/i,
    /child_process/i,
    /require/i,
    /import/i,
    /eval/i,
    /Function(?!.*args)/i,
    /__proto__/i,
    /prototype/i,
    /bind/i,
    /call/i,
    /apply/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(template));
}

// Greeting endpoint with secure template processing
app.post('/greet', (req, res) => {
  const { name, message } = req.body;

  // Validate inputs
  if (typeof name !== 'string' || name.trim() === '' || typeof message !== 'string') {
    return res.status(400).json({ error: 'Name and message are required and must be valid strings.' });
  }

  try {
    // Validate template safety
    if (!validateTemplate(message)) {
      return res.status(400).json({ error: 'Invalid template pattern detected.' });
    }

    // Create sandbox context with all needed variables
    const context = {
      name,  // Add name directly to the context
      env: mockEnv,
      JSON,
      Object,
      ...sandboxHelpers  // Add helper functions
    };

    // Create and execute template function with the context
    const templateFn = new Function(
      ...Object.keys(context),
      `return \`${message}\``
    );

    const result = templateFn(...Object.values(context));

    res.json({ greeting: result });
  } catch (error) {
    console.error('Error processing template:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});