"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, responseData) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(responseData.statusCode).json({
        success: responseData.success,
        statusCode: responseData.statusCode,
        message: responseData.message,
        meta: responseData.meta || null || undefined,
        data: responseData.data || null || undefined,
    });
});
exports.default = sendResponse;
