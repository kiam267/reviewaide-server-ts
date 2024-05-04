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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_router_1 = __importDefault(require("./routers/user-router"));
// set some confing
const PORT = process.env.PORT || 4500;
const app = (0, express_1.default)();
// use
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//user routes
app.use('/api/my/user', user_router_1.default);
// health check
app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('health is good ');
}));
app.listen(PORT, () => {
    console.log(`✨ Server listening on http://localhost:${PORT} `);
});
