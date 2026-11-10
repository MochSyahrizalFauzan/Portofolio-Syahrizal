# Personal Portfolio

Portfolio website for Moch Syahrizal Fauzan, built with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide React.

## Development

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run lint
npm run build
npm run start
```

## Environment

Copy `.env.example` to `.env.local` and set the Formspree endpoint:

```env
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

The contact form reports that it is not configured while this value is empty.

## Content and assets

Portfolio content is separated into `src/data`, translations are in `src/i18n`, and asset paths are centralized in `src/lib/assets.ts`.

Add owner-approved files under:

- `public/documents/` — `cv-id.pdf` and `cv-en.pdf`
- `public/images/profile/` — optional `profile.webp`
- `public/images/projects/` — project thumbnails
- `public/images/certificates/` — certificate images
- `public/icons/` — additional static icons

The UI uses neutral placeholders and does not require these files to render.

## Deployment

Deploy to Vercel and add `NEXT_PUBLIC_FORMSPREE_ENDPOINT` to the production environment when the contact form is ready to be tested.
