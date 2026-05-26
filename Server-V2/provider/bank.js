import crypto from 'crypto'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({
  path: path.join(__dirname, 'key.env')
});
const key = process.env.CVV_SECRET;

function generaCvv(pan, expiry) {
    const data = pan + expiry + "000";
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(data);

    const digest = hmac.digest("hex");
    const number = BigInt("0x" + digest);
    const cvv = number % 1000n;
    return cvv.toString().padStart(3, "0");
}

function verify_cvv(pan, expiry, serviceCode, providerCvv){
    const expected = generaCvv(pan, expiry, serviceCode);
    
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(providerCvv));
}

export {generaCvv, verify_cvv};

