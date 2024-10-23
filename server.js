require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));  // Serve frontend

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB connected');
});

// Rule Schema
const ruleSchema = new mongoose.Schema({
    ruleString: String,
    ast: Object
});

const Rule = mongoose.model('Rule', ruleSchema);

// AST Node Class
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type;
        this.left = left;
        this.right = right;
        this.value = value;
    }
}

// Function to parse a rule string to an AST
function parseRule(ruleString) {
    const tokens = ruleString.split(/\s/).filter(Boolean);
    let stack = [];

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token === "&&" || token === "||") {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(new Node(token, left, right));
        } else if (token === ">" || token === "<" || token === "==") {
            const leftOperand = stack.pop();
            const operator = token;
            const rightOperand = tokens[++i];
            stack.push(new Node(operator, leftOperand, null, rightOperand));
        } else {
            stack.push(token);
        }
    }
    return stack[0];
}

// API to create a rule
app.post('/create_rule', async (req, res) => {
    const { ruleString } = req.body;
    try {
        const ast = parseRule(ruleString);
        const rule = new Rule({ ruleString, ast });
        await rule.save();
        res.status(201).json({ message: 'Rule created', rule });
    } catch (err) {
        res.status(400).json({ error: 'Error creating rule' });
    }
});

// API to evaluate a rule
app.post("/evaluate_rule", async (req, res) => {
    const { ruleId, data } = req.body;
    try {
      const rule = await Rule.findById(ruleId);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      const result = evaluateAST(rule.ast, data);
      res.json({ result });
    } catch (err) {
      console.error("Error evaluating rule:", err);
      res.status(400).json({ error: "Error evaluating rule: " + err.message });
    }
  });
  

// Function to evaluate the AST against user data
function evaluateAST(ast, data) {
    if (!ast) return false;
  
    console.log('Evaluating AST node:', ast);
  
    if (ast.type === "&&") {
      return evaluateAST(ast.left, data) && evaluateAST(ast.right, data);
    } else if (ast.type === "||") {
      return evaluateAST(ast.left, data) || evaluateAST(ast.right, data);
    } else {
      const leftValue = data[ast.left]; // Assuming left is a property name
      const rightValue = ast.right ? (data[ast.right] || ast.value) : ast.value; // Fallback to value if right is not provided
  
      console.log(`Comparing: ${leftValue} ${ast.type} ${rightValue}`);
  
      switch (ast.type) {
        case ">":
          return leftValue > rightValue;
        case "<":
          return leftValue < rightValue;
        case "==":
          return leftValue == rightValue; // Consider strict equality
        default:
          return false;
      }
    }
  }
  
  const userData = {
    age: 35,            // Ensure this is a number
    department: 'Sales', // This should match exactly with the string in the rule
    salary: 50000,      // Example value
    experience: 5       // Example value
  };
  

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

