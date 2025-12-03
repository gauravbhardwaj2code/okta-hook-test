import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
//const bodyParser = require("body-parser");


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})




//app.use(bodyParser.json());

// ---------- Okta Inline Hook Endpoint ----------
app.post("/okta/registration-hook", (req, res) => {
  const body = req.body;
  const request = body?.context?.request || {};

  const email = body?.data?.userProfile?.email || "";
  const userAgent = request.userAgent || "";
  const referer = request.referer || "";
  const ip = request.ipAddress || "";

  // Block bots/scripts by User-Agent
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
    /java/i,
    /go-http/i,
    /httpclient/i,
    /powershell/i,
    /node-fetch/i,
    /postman/i
  ];

  if (botPatterns.some(p => p.test(userAgent))) {
    return deny("Automated registrations are blocked");
  }

  // Block disposable emails
  const disposableDomains = [
    "mailinator.com",
    "yopmail.com",
    "10minutemail.com",
    "tempmail.com"
  ];

  const domain = email.split("@")[1]?.toLowerCase();

  if (disposableDomains.includes(domain)) {
    return deny("Disposable email domains are not allowed");
  }

  // Allow registration
  return res.json({ commands: [] });

  // Helper
  function deny(msg) {
    return res.json({
      commands: [
        {
          type: "com.okta.action.update",
          value: { registration: "DENY" }
        }
      ],
      error: { errorSummary: msg }
    });
  }
});




export default app
