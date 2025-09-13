
# Business Cards — React + TypeScript + Vite

A responsive SPA client for a Business Cards API.
Browse, search, like (favorites), create, edit, and delete business cards with role-based permissions and a smooth, optimistic UI. RTL-friendly and accessibility-minded.
**Note:** The public API used for review may “cold start.” If cards don’t show on the first load, wait a few seconds or refresh once.

---

## ✨ Features

* **Browse & Search** cards with pagination (client filtering on top of server data)
* **Favorites**: like/unlike with **optimistic** updates across pages
* **My Cards**: list, edit, and delete your own cards (business/admin)
* **Create/Edit** with Joi validation and live image preview
* **Card Details** page (+ map embed when address exists)
* **Auth & Roles**: JWT in `localStorage` (`token`), automatic header injection
* **Human Verification**: Cloudflare Turnstile gating
* **Global Loading Overlay**: animated circular logo with progress ring
* **Splash**: quick first-visit splash screen
* **Robust error handling**: toast notifications + global HTTP error bridge
* **Accessibility**: RTL support, keyboard focus outlines, aria roles

---

## 🧱 Tech Stack

* **React 18**, **TypeScript**, **Vite**
* **TanStack Query** (caching, invalidation, optimistic updates)
* **React Router**
* **React Hook Form** + **@hookform/resolvers/joi**
* **Tailwind CSS**
* **Framer Motion** (animations)
* **Axios** (HTTP)
* **Lucide** (icons)

---

## 🚀 Getting Started

```bash
# Install deps
npm install

# Dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Open the Vite URL printed in your terminal (usually [http://localhost:5173](http://localhost:5173)).

---

## 🔧 Environment Variables

Create a `.env` file in the project root (you already committed one).
Make sure it includes these keys:

```env
# API base URLs
VITE_USERS_API_URL=https://bcard-ojqa.onrender.com
VITE_CARDS_API_URL=https://bcard-ojqa.onrender.com

# Cloudflare Turnstile (public site key for review; rotate later if needed)
VITE_TURNSTILE_SITE_KEY=0x4AAAAAABuelzv-yJI8vgaQ

# Fallback image used when an invalid image URL is entered in forms
VITE_FALLBACK_IMAGE_URL=https://cdn.pixabay.com/photo/2019/04/26/16/30/id-4157974_1280.jpg
```

> The Turnstile **site key** is public by design. You can revoke/rotate it later.

---

## 🗂️ Project Structure (high level)

```
src/
  app/routes/               App shell & top routes (App, NotFound, etc.)
  components/               Common UI, layout, forms, feedback
  features/
    cards/                  Cards domain (api, pages, components, validators)
    users/                  Auth, CRM, pages, services, validators
    contact/                Contact form
    human-verification/     Turnstile integration & strategies
  services/                 Axios instances + interceptors
  styles/                   Global CSS (Tailwind layers)
```

---

## 🔐 Auth & Roles

* On sign-in, a JWT is stored in `localStorage` under key **`token`**.
* A small helper parses the token to infer role flags: `admin`, `business`, `user`, `guest`.
* Axios request interceptor automatically attaches:

  * `Authorization: Bearer <token>`
  * `x-auth-token: <token>`
* On `401/403`, the token is cleared and the UI updates.

**Route guards**:

* **/create-card**: business/admin
* **/my-cards**: authenticated
* **/favorites**: authenticated
* **/admin** / **/crm**: admin (and CRM-authorized roles)

---

## 🌐 API (used by the client)

Replace base with `VITE_CARDS_API_URL` / `VITE_USERS_API_URL`.

**Cards**

* `GET /cards` — list cards (server list; client can filter by search text)
* `GET /cards/:id` — details
* `POST /cards` — create (business/admin)
* `PUT /cards/:id` — update (owner/admin)
* `DELETE /cards/:id` — delete (owner/admin)
* `PATCH /cards/:id` — toggle like (auth)

**Users (typical)**

* `POST /users` — sign-up
* `POST /users/login` — sign-in
  *(Forgot password endpoint may not be available on the demo server; the UI handles this safely.)*

---

## ⭐ Optimistic Favorites

When you like/unlike:

* The heart & count update **instantly**.
* We patch **all relevant caches** (`cards`, `cards-paged`, `my-cards`, `favorites`) so other pages stay in sync.
* If the server call fails, we revert to a cached snapshot.

---

## 🖼️ Images & Fallback

* Create/Edit forms show a live preview for valid `http(s)` image URLs.
* If a URL is invalid, the client replaces it with `VITE_FALLBACK_IMAGE_URL` before sending the update.
* When mapping API → UI, a missing image falls back to `/logo.png`.

---

## ♿ Accessibility

* RTL layout & labels
* Focus-visible rings, button semantics, no nested anchors
* `aria-live` for async regions
* Proper `autocomplete` attributes

---

## 🧩 Known Issues / Tips

* **First run delay**: free API host may cold-start; refresh once if needed.
* **Map iframe** (details page): may load in its own mode; we’ve set `referrerPolicy` and `loading="lazy"` to be polite.

---

## 🗺️ Roadmap

* **User Personal Area (אזור אישי)** — *coming soon*

  * View/update profile
  * Secure account deletion (with cascading card deletion & like cleanup)
  * Admin/CRM: blocking hides user cards

---

## 📜 License (MIT)

```
MIT License

Copyright (c) 2025 <Abdullah Marhaj>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

> Replace `<Your Name>` with your actual name or organization.

---

## 🙌 Credits

* **Icons** — [Lucide](https://lucide.dev/)
* **Animations** — [Framer Motion](https://www.framer.com/motion/)
* **UI** — [Tailwind CSS](https://tailwindcss.com/)
* **Maps** — Google Maps embed (when address is provided)

---

