import app from './app';

const PORT = 3804;

app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
});