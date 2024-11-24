require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration for checklist rules
const checklistRules = [
  {
    name: 'Valuation Fee Paid',
    condition: (data) => data.isValuationFeePaid === true,
  },
  {
    name: 'UK Resident',
    condition: (data) => data.isUkResident === true,
  },
  {
    name: 'Risk Rating Medium',
    condition: (data) => data.riskRating === 'Medium',
  },
  {
    name: 'LTV Below 60%',
    condition: (data) => {
      const ltv = (data.loanRequired / data.purchasePrice) * 100;
      return ltv < 60;
    },
  },
];

// Fetch data from API
const fetchData = async () => {
  const apiUrl = process.env.API_KEY; 
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data from API.');
  }
};

// Evaluate checklist rules
const evaluateRules = (data) => {
  return checklistRules.map((rule) => ({
    ruleName: rule.name,
    status: rule.condition(data) ? 'Passed' : 'Failed',
  }));
};

// Display dashboard
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const data = await fetchData();
    const results = evaluateRules(data);
    res.render('dashboard', { results });
  } catch (error) {
    res.status(500).send('Error generating dashboard.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
