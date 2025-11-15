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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var mainWindow = null;
var isDev = !electron_1.app.isPackaged;
function createWindow() {
    var preloadPath = path.join(__dirname, 'preload.js');
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        // 🔹 상단 기본 타이틀바(최소화/닫기 바) 제거
        frame: false,
        // (맥에서 쓸 때도 자연스럽게 보이도록 – 윈도우에서 둬도 문제 없음)
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
        },
        autoHideMenuBar: true,
        show: true,
    });
    // 🔹 앱 실행 시 바로 최대화 (전체화면 느낌)
    mainWindow.maximize();
    if (isDev) {
        var devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173/';
        mainWindow.loadURL(devUrl);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        var indexHtml = path.join(process.resourcesPath, 'dist', 'index.html');
        var fallback = path.join(__dirname, '..', 'dist', 'index.html');
        mainWindow.loadFile(fs.existsSync(indexHtml) ? indexHtml : fallback);
    }
    mainWindow.on('closed', function () { mainWindow = null; });
}
/** -----------------------
 *  프린터 목록 요청
 *  ----------------------*/
electron_1.ipcMain.handle('printers:list', function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var wc, printers, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                wc = event.sender;
                if (!wc.getPrintersAsync) return [3 /*break*/, 2];
                return [4 /*yield*/, wc.getPrintersAsync()];
            case 1:
                _a = _d.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = (_b = wc.getPrinters) === null || _b === void 0 ? void 0 : _b.call(wc);
                _d.label = 3;
            case 3:
                printers = (_c = (_a)) !== null && _c !== void 0 ? _c : [];
                return [2 /*return*/, printers.map(function (p) { return ({
                        name: p.name,
                        displayName: p.displayName,
                        isDefault: p.isDefault,
                    }); })];
        }
    });
}); });
/** -----------------------
 *  이미지(dataURL) 인쇄 (다이얼로그 없이)
 *  ----------------------*/
electron_1.ipcMain.handle('print:image', function (_event, payload) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, dataURL, deviceName, _b, copies;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = payload || {}, dataURL = _a.dataURL, deviceName = _a.deviceName, _b = _a.copies, copies = _b === void 0 ? 1 : _b;
                if (!dataURL || !/^data:image\/(png|jpeg|jpg);base64,/.test(dataURL)) {
                    throw new Error('Invalid dataURL provided for printing');
                }
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var win = new electron_1.BrowserWindow({
                            width: 800,
                            height: 600,
                            show: false,
                            backgroundColor: '#ffffff',
                            webPreferences: { offscreen: true },
                        });
                        // ✅ window.print() 제거 — 다이얼로그가 뜨는 원인이므로 사용하지 않음
                        var html = "<!doctype html>\n<html>\n<head><meta charset=\"utf-8\" />\n<style>\n  *{margin:0;padding:0}\n  html,body{width:100%;height:100%;background:#fff}\n  img{width:100vw;height:100vh;object-fit:contain;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n  @page{size:auto;margin:0}\n</style></head>\n<body>\n  <img id=\"p\" src=\"".concat(dataURL, "\" />\n</body></html>");
                        win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
                        win.webContents.on('did-finish-load', function () { return __awaiter(void 0, void 0, void 0, function () {
                            var err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        // 이미지 로드가 실제로 끝났는지 확인 후 인쇄
                                        return [4 /*yield*/, win.webContents.executeJavaScript("\n          new Promise((resolve, reject) => {\n            const img = document.getElementById('p');\n            if (!img) return reject('no img');\n            if (img.complete) return resolve(true);\n            img.onload = () => resolve(true);\n            img.onerror = () => reject('img error');\n          })\n        ")];
                                    case 1:
                                        // 이미지 로드가 실제로 끝났는지 확인 후 인쇄
                                        _a.sent();
                                        win.webContents.print({
                                            silent: true, // ✅ 다이얼로그 없이 출력
                                            deviceName: deviceName || undefined, // 특정 프린터 지정 가능
                                            printBackground: true,
                                            copies: copies,
                                            margins: { marginType: 'none' },
                                            landscape: false,
                                        }, function (success, reason) {
                                            win.destroy();
                                            if (!success)
                                                reject(new Error(reason || 'Print failed'));
                                            else
                                                resolve(true);
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        win.destroy();
                                        reject(err_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            case 1: return [2 /*return*/, _c.sent()];
        }
    });
}); });
/** -----------------------
 *  앱 생명주기 관리
 *  ----------------------*/
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
