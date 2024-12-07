"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    PORT: process.env.PORT,
    jwt: {
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET,
        REFRESH_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
        RESET_PASS_TOKEN_SECRET: process.env.RESET_PASS_TOKEN,
        RESET_PASS_TOKEN_EXPIRES_IN: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },
    password_salt: process.env.PASSWORD_SALT,
    reset_password_link: process.env.RESET_PASS_LINK,
    default_email: process.env.DEFAULT_EMAIL,
    emailSender: {
        email: process.env.EMAIL,
        password: process.env.APP_PASS,
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
};
