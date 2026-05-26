import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

function gen_JWT_token(payload) {
    return jwt.sign(
        payload,
        process.env.JWT_key,
        { expiresIn: "15m" }
    )
}

function verify_JWT_token(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        return true;
    } catch {
        return false;
    }

}

export {gen_JWT_token, verify_JWT_token};