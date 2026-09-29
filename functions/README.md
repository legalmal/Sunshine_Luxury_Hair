# Order email notifications

The Firestore trigger in `index.js` sends an email for each newly created order. Set the destination in **Admin → Settings → New order notification email**. The destination is stored in `settings/adminNotifications`, which is readable only by signed-in admins and the server function.

Before deploying, configure an SMTP account. Use a provider-approved SMTP credential or app password, not the mailbox's normal password. From the project root, set the following Firebase secrets (the CLI prompts for each value):

```sh
firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASSWORD
firebase functions:secrets:set ORDER_EMAIL_FROM
```

Typical ports are `465` for implicit TLS or `587` for STARTTLS. `ORDER_EMAIL_FROM` must be an address the SMTP account is allowed to send as.

Then install the function dependencies and deploy both the function and Firestore rules from the project root:

```sh
cd functions && npm install
cd ..
firebase deploy --only functions,firestore:rules
```

Email delivery begins after the function and rules are deployed, the SMTP secrets are configured, and the notification email is saved in Admin → Settings. Firebase may require the project to use a billing-enabled plan for Cloud Functions and Secret Manager.
