fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'diksha', email: 'diksha.kambam@gmail.com', password: 'password123', age: 20, gender: 'female' })
})
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => console.log("Response:", status, data))
    .catch(err => console.error("Error:", err));
