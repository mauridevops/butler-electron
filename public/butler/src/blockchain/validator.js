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
exports.validateWithdraw = exports.isOutputSwapValid = exports.isInputSwapValid = exports.isOutputSwapExpirationValid = exports.isInputSwapExpirationValid = void 0;
const moment = require("moment");
const validators_1 = require("./validators");
const config_1 = require("../../config");
const math_1 = require("../utils/math");
const logger_1 = require("../logger");
const service_1 = require("../components/price/service");
const config_2 = require("../config");
const utils_1 = require("../utils");
const config_3 = require("./config");
const utils_2 = require("./utils");
const supportedNetworks_1 = require("../config/supportedNetworks");
exports.isInputSwapExpirationValid = (swap) => {
    const blockchainConfig = config_3.default();
    const now = getCurrentDate(blockchainConfig[swap.network].unix);
    const unixMultiplier = getUnixMultiplier(blockchainConfig[swap.network].unix);
    const result = math_1.greaterThan(math_1.sub(swap.expiration, now), math_1.mul(blockchainConfig[swap.network].VALID_EXPIRATION, unixMultiplier));
    if (!result) {
        logger_1.logError(`INPUT_INVALID_EXPIRATION`, swap);
    }
    return result;
};
exports.isOutputSwapExpirationValid = (swap) => {
    const blockchainConfig = config_3.default();
    const now = getCurrentDate(blockchainConfig[swap.network].unix);
    const unixMultiplier = getUnixMultiplier(blockchainConfig[swap.network].unix);
    const result = math_1.lessThanOrEqual(math_1.sub(swap.expiration, now), math_1.mul(blockchainConfig[swap.network].expiration, unixMultiplier));
    if (!result) {
        logger_1.logError(`OUTPUT_INVALID_EXPIRATION`, swap);
    }
    return result;
};
exports.isInputSwapValid = (swap) => __awaiter(void 0, void 0, void 0, function* () {
    const userConfigInstance = new config_2.default();
    const userConfig = userConfigInstance.getUserConfig();
    const blockchainConfig = config_3.default();
    const inputNetworkValidation = utils_1.safeAccess(blockchainConfig, [swap.network]);
    const outputNetworkValidation = utils_1.safeAccess(blockchainConfig, [swap.outputNetwork]);
    const supportedNetworks = supportedNetworks_1.default();
    const receivers = userConfigInstance.getReceivers(Object.keys(supportedNetworks));
    if (receivers.findIndex((item) => utils_2.compareAddress(swap.sender, item)) !== -1) {
        logger_1.logError(`INPUT_SENDER_EQUAL_BUTLER_RECEIVER`, swap);
        return false;
    }
    if (!exports.isInputSwapExpirationValid(swap)) {
        logger_1.logError(`INPUT_INVALID_EXPIRATION`, swap);
        return false;
    }
    if (!outputNetworkValidation) {
        logger_1.logError(`INPUT_SECONDARY_CHAIN_VALIDATION_FAILED`, swap);
        return false;
    }
    if (!inputNetworkValidation) {
        logger_1.logError(`INPUT_CHAIN_VALIDATION_FAILED`, swap);
        return false;
    }
    if (!utils_2.compareAddress(swap.receiver, utils_1.safeAccess(userConfig, ['WALLETS', swap.network, 'ADDRESS']))) {
        logger_1.logError(`INPUT_INVALID_RECEIVER`, swap);
        return false;
    }
    if (!isInputPriceValid(swap)) {
        logger_1.logError(`INPUT_INVALID_PRICE`, swap);
        return false;
    }
    return true;
});
exports.isOutputSwapValid = (swap, takerDesiredAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const userConfig = new config_2.default().getUserConfig();
    const blockchainConfig = config_3.default();
    const inputNetworkValidation = utils_1.safeAccess(blockchainConfig, [swap.network]);
    const outputNetworkValidation = utils_1.safeAccess(blockchainConfig, [swap.outputNetwork]);
    if (!inputNetworkValidation) {
        logger_1.logError(`INPUT_CHAIN_VALIDATION_FAILED`, swap);
        return false;
    }
    if (!outputNetworkValidation) {
        logger_1.logError(`OUTPUT_CHAIN_VALIDATION_FAILED`, swap);
        return false;
    }
    if (utils_2.compareAddress(swap.outputAddress, utils_1.safeAccess(userConfig, ['WALLETS', swap.network, 'ADDRESS']))) {
        logger_1.logError(`OUTPUT_WRONG_OUTPUT_ADDRESS`, swap);
        return false;
    }
    if (utils_2.compareAddress(swap.sender, swap.receiver)) {
        logger_1.logError(`OUTPUT_SENDER_CANNOT_EQUAL_RECEIVER`, swap);
        return false;
    }
    const isPairValid = isInputPairValid(swap);
    if (!isPairValid) {
        logger_1.logError(`OUTPUT_INVALID_PAIR`, swap);
        return false;
    }
    const allowedSlippageAmount = math_1.mul(takerDesiredAmount, config_1.default.SLIPPAGE);
    if (math_1.greaterThan(math_1.sub(takerDesiredAmount, swap.inputAmount), allowedSlippageAmount)) {
        logger_1.logError(`OUTPUT_TOO_HIGH_SLIPPAGE_FOR_TAKER`, swap);
        return false;
    }
    if (!exports.isOutputSwapExpirationValid(swap)) {
        logger_1.logError(`OUTPUT_INVALID_EXPIRATION`, swap);
        return false;
    }
    return true;
});
exports.validateWithdraw = (withdraw) => __awaiter(void 0, void 0, void 0, function* () {
    const networkValidation = yield validators_1.default[withdraw.network].validateWithdraw(withdraw);
    return networkValidation;
});
function isInputPairValid(swap) {
    const userConfig = new config_2.default().getUserConfig();
    const pair = utils_1.safeAccess(userConfig, ['PAIRS', `${swap.network}-${swap.outputNetwork}`]);
    if (pair) {
        return true;
    }
    return false;
}
const getCurrentDate = (unix) => {
    const now = moment.now().valueOf();
    if (unix) {
        return Math.floor(now / 1000);
    }
    return now;
};
const getUnixMultiplier = (unix) => {
    if (unix) {
        return 1;
    }
    return 1000;
};
function isInputPriceValid(swap) {
    try {
        const priceService = new service_1.PriceService();
        const blockchainConfig = config_3.default();
        const pairPrice = priceService.getPairPriceWithSpreadAndFee(swap.network, swap.outputNetwork);
        const inputDecimals = blockchainConfig[swap.network].decimals;
        const outputDecimals = blockchainConfig[swap.outputNetwork].decimals;
        const lockedAmountSlashed = math_1.divDecimals(swap.inputAmount, inputDecimals);
        const desiredAmountSlashed = math_1.divDecimals(swap.outputAmount, outputDecimals);
        const marketActualPrice = math_1.mul(lockedAmountSlashed, pairPrice);
        const maxAllowedSlippage = math_1.mul(marketActualPrice, config_1.default.SLIPPAGE);
        return math_1.greaterThan(maxAllowedSlippage, math_1.sub(desiredAmountSlashed, marketActualPrice));
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=validator.js.map