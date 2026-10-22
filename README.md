# RLV NEXUS

A responsive, multi-page agency website built with React, Vite, Tailwind CSS, React Router, Framer Motion, Lucide React, and Firebase. The site includes public project/client/service/review showcases, a protected content admin, image uploads, and a server-side contact enquiry endpoint.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Create a production build with `npm run build`, or preview it locally with `npm run preview`.

## Firebase setup

Firebase is optional for local UI development; without Firebase settings the site uses clearly identified demo projects, services, and review examples. Live data and admin features are enabled only after configuring and deploying a real Firebase project.

1. Create a Firebase project and register a Web App. Authentication and Firestore need the project settings below; `VITE_FIREBASE_APP_ID` is optional for those services but should be added from the registered Web App when available:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID` (optional until a Web App is registered)
2. Enable **Firestore** and **Authentication → Email/Password** in Firebase Console. Website images use public HTTP/HTTPS URLs; Firebase Storage uploads are not used.
3. Configure **App Check** for the web app with a reCAPTCHA Enterprise site key. Add the local and production domains to the key's allowed domains, then set `VITE_FIREBASE_APP_CHECK_SITE_KEY` in `.env.local`. The contact callable requires a valid App Check token.
4. Use Node.js 22 for Cloud Functions, install their dependencies, and select the Firebase project with the Firebase CLI:

   ```sh
   npm install --prefix functions
   firebase login
   firebase use --add
   ```

5. Visitors can create regular accounts at `/login`; Firebase Authentication stores credentials, while Firestore stores their profile and `role: "user"`. To grant admin access, create or select an account in **Authentication → Users**, then create `users/{UID}` in Firestore with `{ "role": "admin" }`. The legacy `{ "admin": true }` format is also supported. Only the project owner should grant admin access; public account creation cannot promote accounts.
6. Deploy Firebase rules, indexes, Storage, Functions, and Hosting after the project is configured:

   ```sh
   npm run build
   firebase deploy --only firestore:rules,firestore:indexes,functions,hosting
   ```

   Cloud Functions deployment requires a Firebase plan that supports Functions and the required billing setup. The enquiry function is deployed in `us-central1`; configure the client callable in that same region.
7. Sign in at `/admin`. Create genuine, approved records and publish them when ready. Draft records are visible only to authenticated admins. Public pages read only published documents.

### Admin and collection model

- Firestore collections: `projects`, `clients`, `services`, `testimonials`, and `serviceBookings`. About page text, media URLs, languages, and custom technology icon URLs are stored in `settings/about` and edited in the admin panel. Project records support cover/gallery image URLs, a video URL, and custom technology icon URLs. User roles are stored in `users/{UID}` and managed by the project owner; only users with `role: "admin"` (or the legacy `admin: true`) can access the admin page and its protected data. Signed-in users can create short service requests with an optional reference URL and read only their own requests at `/account`; admins can update booking status in the admin dashboard.
- Private contact form submissions are written by the `submitEnquiry` callable function to `enquiries`. Firestore client-side writes to that collection are denied. Admins can review enquiries, update their status, add private notes, or delete them.
- `rateLimits` stores time-bucketed hashes for enquiry throttling. The Firestore TTL policy uses `resetAt` to remove expired rate-limit records.
- Admins add project, client, and review images by entering public HTTP/HTTPS URLs. Admin access is enforced by Firestore rules in addition to the dashboard UI. Public visitors can only read published website content.

## Contact form

When Firebase and App Check are configured and the callable function is deployed, contact submissions are validated server-side, rate-limited, and saved privately in Firestore. If these integrations are missing or unavailable, the form displays an error instead of claiming that an enquiry was sent. The privacy policy is a starter and must be updated to describe the real business, retention period, Firebase region/processors, and contact details before launch.

## Production checklist

- Replace `VITE_SITE_URL` with the real canonical website origin and update `public/sitemap.xml`.
- Add real contact and social profile details in `.env.local`; blank values intentionally hide optional contact links.
- Add only approved client names, logos, case studies, project URLs, and testimonials. Sample concepts are marked and should be replaced before launch.
- Review the privacy policy with the business owner and legal counsel.
- Never commit `.env.local`, Firebase service-account credentials, or other secrets. Firebase web-app configuration is public client configuration; authorization relies on Firebase Authentication and server-enforced rules.

## Pages

Home, services, projects and project details, clients, about, contact, privacy policy, `/login`, `/account`, `/admin`, and a custom not-found route.
