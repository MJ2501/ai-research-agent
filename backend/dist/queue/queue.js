"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.redis = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../env");
exports.redis = new ioredis_1.default(env_1.env.REDIS_URL, { maxRetriesPerRequest: null });
exports.queue = new bullmq_1.Queue("research", {
    connection: exports.redis,
});
