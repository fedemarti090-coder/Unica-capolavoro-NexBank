import express from 'express';
const testRouter = express.Router();

testRouter.post('/test', (req, res) => {
    res.json({
        ans: true,
        message: "Server online",
    });
});

export default testRouter;