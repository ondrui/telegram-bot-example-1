const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello debug_Yourself');
});

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
