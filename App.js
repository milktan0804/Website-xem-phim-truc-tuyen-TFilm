const express = require('express');
const app = express();
const port = 3000;

// Giả sử bạn đã có một mảng phim
const movies = [
    { id: 1, title: 'Phim 1' },
    { id: 2, title: 'Phim 2' }
];

app.get('/api/movies', (req, res) => {
    res.json(movies);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});