# 🌊 Drift MVP V1 — Product Requirements Document

## 1. Product Overview

**Drift** is a no-account, ephemeral, poetic digital postcard designed to foster connection.

- Each drift is **link-based** and can be opened multiple times **within 24 hours**.
- Contains:
  - **1–8 elements**: text, image, sticker
  - Optional sender name
  - **Atmosphere** (Rain, Sunrise, Midnight) with **embedded ambient sound**
- Experiences are split into:
  1. **Editing / Creation Experience**
  2. **Opening / Receiving Experience**
- Design principles:
  - Minimal, poetic, whimsical
  - Elegant, subtle animations
  - Lightweight, freeform, tactile feel

---

## 2. Interface Flow (Screens)

### Landing / Home
- Full-screen river animation (optional)
- Button: “Create a Drift” → enters **Creation Flow**

### Creation / Editing Flow
1. **Canvas**
   - Freeform drag + resize + rotate elements
   - Max 8 elements, min 1 required
   - Overlap allowed
2. **Add Elements**
   - Text (small, fixed width)
   - Images (up to 2, resizable)
   - Stickers (5 fixed, cute/stamped style)
3. **Optional Input**
   - Sender name
4. **Select Atmosphere**
   - Rain 🌧️ → ambient rain sound
   - Sunrise 🌅 → ambient wind / birds
   - Midnight 🌙 → ambient crickets / night
5. **Preview Drift**
   - Animates elements and atmosphere
6. **Send / Generate Link**
   - Generates unique URL `/d/[id]`
   - Shows copyable link

### Opening / Receiving Flow
1. **River Entry Screen**
   - Full-screen animated river
   - Bottle floats in
   - Optional subtle text: “You’ve received something”
2. **Tap Bottle → Envelope Reveal**
   - Bottle moves to center
   - Envelope animation (scale/fade)
   - Elements fade in / animate
   - Atmosphere animation + embedded ambient sound plays
   - Optional sender name: “From X”
3. **Reopenable within 24h**
4. **Expiry**
   - After 24h, bottle disappears
   - River remains
   - Sound stops
   - Poetic message: “This drift has passed”

---

## 3. Editing Experience (Detailed)

- Canvas
  - Freeform drag/scale/rotate
  - Max 8 elements, min 1
  - Overlap allowed
- Elements
  - Text: small fonts, fixed width
  - Images: resizable, repositionable
  - Stickers: 5 fixed, stamped style
- Atmosphere
  - Rain / Sunrise / Midnight
  - Animation + sound triggered when opened
- Sender Name: optional
- Preview: animates element positions, layering, atmosphere
- Send: generates unique URL, copyable link

---

## 4. Opening / Receiving Experience (Detailed)

- River Entry: full-screen animation, bottle floats
- Drift Reveal
  - Envelope opens (scale/fade)
  - Elements fade in, staggered
  - Atmosphere animation + ambient sound
  - Optional sender name
- Audio Behavior
  - Loops gently
  - Stops automatically on expiry
  - Optional subtle mute icon
- Expiry: 24h, bottle gone, sound stops, poetic message

---

## 5. Data Model

```json
{
  "id": "string",
  "createdAt": 0,
  "expiresAt": 0,
  "senderName": "string | null",
  "scene": {
    "atmosphere": "rain | sunrise | midnight",
    "audio": { "url": "string" },
    "elements": [
      {
        "id": "string",
        "type": "image | text | sticker",
        "content": "string",
        "x": 0.0,
        "y": 0.0,
        "scale": 1.0,
        "rotation": 0,
        "zIndex": 0,
        "opacity": 1.0
      }
    ]
  }
}
```

Audio URL: embedded ambient sound for atmosphere
Coordinates normalized (0–1)
zIndex = layer
Opacity optional (default 1)

## 6. UX Principles / Guardrails
Minimal, calm, poetic, hopeful
Slow, intentional animations
Freeform layout to encourage creativity
Stickers/text tactile
Audio = atmosphere only
Max 8 elements per drift

## 7. Technical Notes
Tech stack: React / Next.js (App Router)
Minimal backend (Supabase/Firebase) for JSON storage + expiry
Store images in cloud storage
Animations for:
River
Bottle floating
Envelope opening
Elements fading in
Atmosphere loop
Audio plays only in opening flow, stops at expiry

## 8. MVP Priorities / Build Order
Hardcode sample JSON drift → validate rendering + opening experience
Implement river + bottle + envelope + fade-in elements + ambient sound
Build editor:
Drag / resize / rotate
Add elements (text, image, sticker)
Sender name
Atmosphere selection
Preview & generate link
Backend:
- Store JSON
- Fetch by ID
- Expiry logic
- Polishing:
  - Animations
  - Sound
  - Stickers
  - Poetic expiry message
