Below is an example **README** that includes both the **context** (what we're building and why) and a **step-by-step guide** (complete with checkboxes) for either a human or an AI agent to follow when implementing this simple Next.js flyer-signup app. Feel free to adapt it to your specific workflow or environment.

---

# AI-Agent Guide & README

**Context**  
We want a no-auth, minimalistic web app for a single political candidate who is distributing flyers. There are two interfaces:

1. An **Admin Page** (`/admin`) for the candidate to create, edit, and remove timeslots.
2. A **Public/Helper Page** (`/`) for volunteers to see those timeslots, sign up with their name (plus optional note), and remove themselves if needed.

**Key Features**

- **LocalStorage** stores the volunteer's name, so they only enter it once.
- **Mobile-friendly** forms with `<input type="date">` and `<input type="time">`.
- **No authentication**. The candidate simply knows the `/admin` route, and volunteers only know the `/` route.
- Minimal data model with timeslots and signups stored in an array.
- Basic Next.js app structure with serverless API routes.
- Ephemeral or simple DB storage is acceptable.

---

## Guide for an AI Agent

1. **Set up Environment**

   - Create with latest node, and set node version to .nvmrc
   - (Optional) Create a new Git repository for version control.
   - use pnpm

2. **Initialize Next.js Project**

   - Use `npx create-next-app flyer-signup` (or any name you prefer).

3. **Install/Configure a Minimal DB** (if desired)

   - Otherwise, install a lightweight DB or keep a simple JSON-based store in memory for the prototype.

4. **Create the Pages**

   - **`pages/index.tsx`**: Public/Helper Page.
   - **`pages/admin.tsx`**: Admin Page.

5. **Set Up API Routes** (`pages/api`)

   - **`/api/timeslots/index.ts`**: `GET` all timeslots, `POST` create new timeslot.
   - **`/api/timeslots/[id].ts`**: `DELETE` a timeslot by ID.
   - **`/api/signups/index.ts`**: `POST` create signup.
   - **`/api/signups/[slotId].ts`**: `DELETE` remove signup from a slot.

6. **Implement LocalStorage Logic**

   - In the public page (`/index.tsx`), prompt for user name if not in `localStorage`.
   - Store name in `localStorage.setItem('myName', name)`.

7. **Test the App**

   - Run locally with `npm run dev` or `yarn dev`.
   - Open [http://localhost:3000](http://localhost:3000) for the helper page, [http://localhost:3000/admin](http://localhost:3000/admin) for the admin page.
   - Verify timeslot creation, signups, and removal.

8. **Deploy** (optional)
   - Deploy to [Vercel](https://vercel.com/), Netlify, or your choice of hosting provider.

---

## Development Checklist

- [x] **Initialize the Next.js app**

  - [x] Run `npx create-next-app flyer-signup`
  - [x] Delete boilerplate files not needed

- [x] **Install Dependencies**

  - [x] Decide on DB approach (in-memory, file, or actual DB)
  - [x] If using a DB, add relevant npm packages (e.g., `prisma` or `mongodb`)

- [x] **Create Pages**

  - [x] `pages/admin.tsx` for candidate management
  - [x] `pages/index.tsx` for helpers (public)

- [x] **Implement Admin Page** (`admin.tsx`)

  - [x] Fetch timeslots (GET `/api/timeslots`)
  - [x] Form to add new slot (POST `/api/timeslots`)
  - [x] List existing slots and signups
  - [x] "Delete" button to remove a slot (DELETE `/api/timeslots/[id]`)

- [x] **Implement Helper Page** (`index.tsx`)

  - [x] Check `localStorage` for stored name
  - [x] If none, show form to set name
  - [x] Display all slots (GET `/api/timeslots`)
  - [x] "Sign up" button → POST `/api/signups` with `{ slotId, name, note }`
  - [x] Display signups under each slot; if `signup.name === storedName`, show a "Remove me" button
  - [x] "Remove me" button → DELETE `/api/signups/[slotId]` with `{ name }` in the body

- [x] **Create API Routes**

  1. `/api/timeslots`
     - [x] `GET`: Return all timeslots
     - [x] `POST`: Create new timeslot (`date`, `startTime`, `endTime`, `location`)
  2. `/api/timeslots/[id]`
     - [x] `DELETE`: Remove a timeslot
  3. `/api/signups`
     - [x] `POST`: Add a signup (push `name`, `note`)
  4. `/api/signups/[slotId]`
     - [x] `DELETE`: Remove a signup for the given `slotId`

- [x] **Test Locally**

  - [x] Run `npm run dev`
  - [x] Check timeslot creation on `/admin`
  - [x] Check helper sign-ups on `/`
  - [x] Verify name is saved in browser localStorage

- [ ] **Deployment** (optional)
  - [ ] Connect to Vercel or alternative hosting platform
  - [ ] Deploy the Next.js app
  - [ ] Confirm both routes (`/admin` and `/`) work publicly

---

## License / Usage

- This minimal app is intended for personal or campaign use.
- Feel free to modify and redistribute as you see fit.

---

That's it! Following this plan ensures that whether a human developer or an AI coding agent is doing the work, all essential tasks and context are included.
