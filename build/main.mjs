"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_ts_1 = require("./routes/auth.routes.ts");
const user_routes_ts_1 = require("./routes/user.routes.ts");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
const app = (0, express_1.default)();
const corsOptions = {
    origin: '*', //Momentaneamente aceptara requests de cualquier lugar
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};
const publicPath = path_1.default.resolve('public');
app.disable('x-powered-by');
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(publicPath));
app.use((0, cors_1.default)(corsOptions));
app.use('/api/auth', auth_routes_ts_1.authRouter);
app.use('/api/user', user_routes_ts_1.userRouter);
app.get('/api/documentation', (_req, res) => {
    res.sendFile(path_1.default.join(publicPath, 'documentation.html'));
});
// Manejo de errores de solicitud malformada y errores internos que no fueron capturados
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Solicitud mal formada: JSON inválido' });
    }
    next();
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});
app.listen(PORT);
