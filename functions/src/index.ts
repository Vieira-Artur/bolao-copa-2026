import * as admin from 'firebase-admin'

admin.initializeApp()

export { onMatchFinished } from './onMatchFinished'
export { scheduledSync } from './scheduledSync'
export { manualSync } from './manualSync'
