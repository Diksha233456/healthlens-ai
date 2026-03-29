const axios = require('axios');
axios.post('http://localhost:5000/api/auth/register', { name: 'test', email: 'test@test.com', password: 'password123' })
    .then(res => console.log('Success:', res.data))
    .catch(err => console.log('Error:', err.response?.data || err.message));
