import * as functions from 'firebase-functions'
import { syncResults } from './scheduledSync'

const ADMIN_KEY = functions.config().admin?.key ?? ''

export const manualSync = functions.https.onRequest(async (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY || !ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const result = await syncResults()
    res.status(200).json({ ok: true, ...result })
  } catch (e: any) {
    console.error('Manual sync error:', e)
    res.status(500).json({ error: e.message })
  }
})
