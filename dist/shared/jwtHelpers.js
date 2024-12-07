"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelpers = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const generateToken = (payload, secret, expiresIn) => {
    try {
        const token = jsonwebtoken_1.default.sign(payload, secret, {
            algorithm: "HS256",
            expiresIn,
        });
        return token;
    }
    catch (error) {
        return null;
    }
};
const verifyToken = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            // Handle token expiration error
            return { error: "Token has expired" };
        }
        else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            // Handle other JWT errors
            return { error: "Invalid token" };
        }
        else {
            // Handle unexpected errors
            return { error: "Token verification failed" };
        }
    }
};
exports.jwtHelpers = {
    generateToken,
    verifyToken,
};
