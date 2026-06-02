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
exports.onMatchFinished = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const scoring_1 = require("./scoring");
const db = admin.firestore();
exports.onMatchFinished = functions.firestore
    .document('matches/{matchId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.status === after.status)
        return null;
    if (after.status !== 'finished')
        return null;
    if (after.homeScore === null || after.awayScore === null)
        return null;
    const matchId = context.params.matchId;
    const real = { h: after.homeScore, a: after.awayScore };
    const phase = after.phase;
    const participantsSnap = await db.collection('participants').get();
    await Promise.all(participantsSnap.docs.map(async (pDoc) => {
        const participantId = pDoc.id;
        const participantName = pDoc.data().name;
        const predSnap = await db
            .collection('predictions')
            .doc(participantId)
            .collection('matches')
            .doc(matchId)
            .get();
        if (!predSnap.exists)
            return;
        const pred = predSnap.data();
        const prediction = { h: pred.homeScore, a: pred.awayScore };
        const points = (0, scoring_1.calcMatchPoints)(prediction, real, phase);
        const type = (0, scoring_1.getScoreType)(prediction, real, phase);
        const scoreRef = db.collection('scores').doc(participantId);
        await db.runTransaction(async (tx) => {
            const scoreSnap = await tx.get(scoreRef);
            const existing = scoreSnap.exists
                ? scoreSnap.data()
                : {
                    participantId,
                    participantName,
                    total: 0,
                    matchPoints: 0,
                    classificationPoints: 0,
                    artilheiroPoints: 0,
                    exactScores: 0,
                    correctResults: 0,
                    tiebreaker: { champion: false, artilheiro: false, vice: false, third: false, exactCount: 0 },
                    matchBreakdown: {},
                };
            const prevBreakdown = existing.matchBreakdown?.[matchId];
            const prevPoints = prevBreakdown?.points ?? 0;
            const exactDelta = (type === 'exact' ? 1 : 0) - (prevBreakdown?.type === 'exact' ? 1 : 0);
            const resultDelta = (type !== 'miss' ? 1 : 0) - (prevBreakdown && prevBreakdown.type !== 'miss' ? 1 : 0);
            tx.set(scoreRef, {
                ...existing,
                participantName,
                matchPoints: (existing.matchPoints ?? 0) + points - prevPoints,
                total: (existing.total ?? 0) + points - prevPoints,
                exactScores: (existing.exactScores ?? 0) + exactDelta,
                correctResults: (existing.correctResults ?? 0) + resultDelta,
                matchBreakdown: {
                    ...(existing.matchBreakdown ?? {}),
                    [matchId]: { points, type },
                },
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
    }));
    console.log(`Scores recalculated for match ${matchId}`);
    return null;
});
//# sourceMappingURL=onMatchFinished.js.map