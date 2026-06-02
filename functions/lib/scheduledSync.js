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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledSync = void 0;
exports.syncResults = syncResults;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const API_KEY = functions.config().apisports?.key ?? '';
const API_HOST = 'v3.football.api-sports.io';
const LEAGUE_ID = 1;
const SEASON = 2026;
async function fetchFinishedMatches() {
    const url = `https://${API_HOST}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=FT`;
    const res = await fetch(url, {
        headers: { 'x-apisports-key': API_KEY },
    });
    if (!res.ok) {
        console.error(`API error ${res.status}`);
        return [];
    }
    const data = await res.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
        console.error('API errors:', JSON.stringify(data.errors));
        return [];
    }
    return data.response ?? [];
}
async function fetchLiveMatches() {
    const url = `https://${API_HOST}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=1H-2H-HT-ET-P`;
    const res = await fetch(url, {
        headers: { 'x-apisports-key': API_KEY },
    });
    if (!res.ok)
        return [];
    const data = await res.json();
    return data.response ?? [];
}
async function syncResults() {
    // Match Firestore docs by apiId field
    const matchesSnap = await db.collection('matches').get();
    const apiIdToDocId = {};
    matchesSnap.docs.forEach(d => {
        if (d.data().apiId)
            apiIdToDocId[d.data().apiId] = d.id;
    });
    const [finished, live] = await Promise.all([fetchFinishedMatches(), fetchLiveMatches()]);
    const batch = db.batch();
    for (const f of finished) {
        const apiId = String(f.fixture.id);
        const docId = apiIdToDocId[apiId];
        if (!docId)
            continue;
        batch.update(db.collection('matches').doc(docId), {
            homeScore: f.goals.home,
            awayScore: f.goals.away,
            status: 'finished',
        });
    }
    for (const f of live) {
        const apiId = String(f.fixture.id);
        const docId = apiIdToDocId[apiId];
        if (!docId)
            continue;
        batch.update(db.collection('matches').doc(docId), {
            homeScore: f.goals.home ?? null,
            awayScore: f.goals.away ?? null,
            status: 'live',
        });
    }
    await batch.commit();
    await db.collection('config').doc('settings').set({ lastSync: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { finished: finished.length, live: live.length };
}
// Runs every hour — only active during Copa (June 11 – July 19, 2026)
exports.scheduledSync = functions.pubsub
    .schedule('0 * * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async () => {
    const result = await syncResults();
    console.log(`Sync complete: ${result.finished} finished, ${result.live} live`);
    return null;
});
//# sourceMappingURL=scheduledSync.js.map