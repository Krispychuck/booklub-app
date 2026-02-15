# BooKlub Design System

**Last Updated:** February 14, 2026

---

## 🎨 Design Philosophy

BooKlub embraces a **classic early cinema aesthetic** - black and white with vintage gold accents. The design evokes old film reels, silent movie title cards, and the golden age of Hollywood, creating a sophisticated literary atmosphere.

---

## 🎬 Color Palette

### Primary Colors
- **Black:** `#000000` - Main text, backgrounds, borders
- **White:** `#ffffff` - Alternate backgrounds, text on dark
- **Off-White:** `#fafafa` - Subtle backgrounds for content areas

### Accent Colors
- **Vintage Gold:** `#c8aa6e` - Primary action buttons, special features
  - This warm, muted gold evokes film reels, awards, and classic cinema
  - Use for main CTAs and important interactive elements

### Neutral Grays
- `#f0f0f0` - Hover states for white buttons
- `#888` - Secondary text, labels
- `#666` - Tertiary text, timestamps
- `#333` - Borders, dividers on dark backgrounds
- `#222` - Subtle dividers

---

## 🔘 Button System

### **Primary Actions (Black/Gold/White)** ⭐

Use this style for main actions throughout the app. This is your signature button style.

**Visual:** Transparent with vintage gold border, fills gold on hover

**CSS Template:**
```css
.primary-button {
  background: transparent;
  border: 2px solid #c8aa6e;
  border-radius: 8px;
  color: #ffffff; /* Use #000000 on white backgrounds */
  padding: 8px 20px;
  font-size: 11px;
  font-family: 'Georgia', serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover:not(:disabled) {
  background-color: #c8aa6e;
  color: #000000;
}

.primary-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

**Use Cases:**
- "Ask Author" button (chat)
- "Map Discussion" button (chat)
- "Create Club" button (home/my clubs)
- "Join Club" button (my clubs)
- Main call-to-action buttons throughout app
- Submit buttons in forms

**Current Implementations:**
- `.mind-map-button` in `ClubChat.css`

---

### **Secondary Actions (Pure Black/White)**

Use this classic cinema style for less prominent but still important actions.

**Visual:** Black and white only, clean and simple

**CSS Template:**
```css
.secondary-button {
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #000000;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-family: 'Georgia', serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Use Cases:**
- "Group Comment" button (chat - human-to-human messaging)
- "Back" buttons (navigation)
- "Members" button (view club members)
- Cancel buttons in modals
- Secondary navigation actions

**Current Implementations:**
- `.group-comment-btn` in `ClubChat.css`
- `.back-button` in `ClubChat.css`

---

### **Tertiary/Utility Actions (Minimal)**

Use for subtle actions that shouldn't compete with primary/secondary buttons.

**Visual:** Just a border, inherits color from context

**CSS Template:**
```css
.tertiary-button {
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 6px;
  color: inherit;
  padding: 4px 14px;
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tertiary-button:hover {
  opacity: 1;
}
```

**Use Cases:**
- Delete message button
- Close buttons in panels
- Utility actions in headers
- Navigation links

**Current Implementations:**
- `.delete-message-btn` in `ClubChat.css`
- `.mind-map-close-btn` in `MindMapVisualization.css`

---

## 📝 Typography

### Font Families

**Serif (Literary/Content):**
- `'Georgia', serif`
- Use for: Body text, book titles, author names, content-heavy areas

**Monospace (Technical/Labels):**
- `'Courier New', monospace`
- Use for: Labels, timestamps, technical information, code-like elements
- Often paired with uppercase and letter-spacing for cinematic title card effect

### Type Scale

| Level    | Size      | Use Case                                      |
|----------|-----------|-----------------------------------------------|
| Display  | 2rem      | Page titles ("My Book Clubs")                 |
| Heading  | 1.5rem    | Card titles, modal headers                    |
| Subhead  | 1.35rem   | Book titles in cards                          |
| Body     | 1rem      | Default text                                  |
| Caption  | 0.85rem   | Labels, metadata, timestamps                  |
| Micro    | 0.75rem   | Badges, button labels                         |

**Labels (monospace):**
```css
.label {
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
```

**Body Text:**
```css
.body-text {
  font-size: 1rem;
  font-family: 'Georgia', serif;
  line-height: 1.6;
}
```

---

## 🎭 Component Patterns

### Modals

**Structure:**
- Black background overlay with transparency
- White or black modal container with thick border
- Cinema-style header with monospace font

**Example:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border: 3px solid #000;
  border-radius: 16px;
  padding: 30px 40px;
  max-width: 400px;
}

.modal-header {
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.2rem;
  margin-bottom: 20px;
}
```

### Messages/Chat

**Structure:**
- User messages: White background, black border, aligned right
- AI messages: Black background, white text, aligned left
- Monospace font for sender names and timestamps

### Cards

**Structure:**
- White background with black border
- Subtle hover states
- Georgia serif for titles and content

---

## 🎬 Animation Guidelines

### Transitions

**Standard Duration:** 0.3s ease — used on ALL interactive elements (buttons, inputs, links, cards).

### Page Transitions
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-transition { animation: fadeInUp 0.4s ease-out; }
```

### Modal Animations
- Overlay fades in over 0.2s
- Content slides up + scales from 0.97 over 0.3s

### Card Hover
- Book cards: `translateY(-5px)` + soft shadow
- Club cards: `translateY(-3px)` + soft shadow

---

## 📐 Spacing System

Use consistent spacing throughout:

- **Extra Small:** 4px
- **Small:** 8px
- **Medium:** 12px
- **Base:** 16px (most common padding)
- **Large:** 20px
- **Extra Large:** 24px
- **Huge:** 30px
- **Massive:** 40px

---

## 🎯 Layout Guidelines

### Containers

**Max Width:** 900px for chat and content areas
**Margins:** Auto-center with left/right borders

### Borders

**Primary Borders:** 2px solid black
**Subtle Dividers:** 1px solid #222 (on dark) or #ddd (on light)
**Focus States:** 2px solid #c8aa6e

### Border Radius (iOS/macOS-inspired)

| Element     | Radius | Examples                                      |
|-------------|--------|-----------------------------------------------|
| Modals      | 16px   | Create club, join club, delete confirm        |
| Cards       | 12px   | Book cards, club cards, auth prompt, detail panel |
| Containers  | 10px   | Book info sections, confirm dialogs           |
| Buttons     | 8px    | All buttons and inputs                        |
| Small       | 6px    | Delete message button, close buttons          |

---

## 🔄 Implementation Checklist

### Current Button Implementations to Update

#### ClubChat.js (`.ask-author-btn`)
- ✅ Currently uses black/white
- 🎯 **Change to:** Primary (gold) style
- **Reason:** Main action for AI interaction

#### ClubChat.js (`.group-comment-btn`)
- ✅ Currently uses black/white
- ✅ **Keep as:** Secondary style
- **Reason:** Human-to-human is less prominent than AI

#### ClubChat.js (`.mind-map-button`)
- ✅ Already uses gold style
- ✅ **Keep as:** Primary style
- **Reason:** Special feature, correctly styled

#### Home.js / MyClubs.js
- 🎯 **"Create Club" button** → Primary (gold) style
- 🎯 **"Join Club" button** → Primary (gold) style
- **Reason:** Main actions on these pages

#### Modals (CreateClubModal, JoinClubModal)
- 🎯 **Submit buttons** → Primary (gold) style
- 🎯 **Cancel buttons** → Secondary (black/white) style

---

## 📝 Development Notes

### Adding New Buttons

1. **Identify button importance:**
   - Main action? → Primary (gold)
   - Supporting action? → Secondary (black/white)
   - Utility action? → Tertiary (minimal)

2. **Apply appropriate class:**
   - Use the CSS templates above
   - Maintain consistent padding and font sizing
   - Always include hover and disabled states

3. **Test on both backgrounds:**
   - Gold buttons on black backgrounds use `color: #ffffff`
   - Gold buttons on white backgrounds use `color: #000000`
   - Adjust as needed for contrast

### Accessibility

- Maintain 4.5:1 contrast ratio minimum
- Gold `#c8aa6e` on black `#000000` = ✅ Passes WCAG AA
- Always include `:focus` styles for keyboard navigation
- Use `aria-label` for icon-only buttons

---

## 🎨 Design Principles Summary

1. **Vintage Cinema First** - Every decision should reinforce the classic film aesthetic
2. **Gold = Action** - Vintage gold signals "this is important, click here"
3. **Black & White = Classic** - Core interactions stay monochrome
4. **Typography Matters** - Serif for content, monospace for labels
5. **Subtle, Not Loud** - Animations and transitions should be refined, not flashy
6. **Consistent Spacing** - Use the spacing system, don't invent new values
7. **Clear Hierarchy** - User should instantly know what's primary vs secondary

---

**End of Design System Document**
