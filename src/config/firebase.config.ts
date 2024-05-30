import * as admin from 'firebase-admin'
import serviceAccount from './serviceAccount.json'

export default admin.initializeApp({
    credential: admin.credential.cert(
        serviceAccount as admin.ServiceAccount | string
    )
})
