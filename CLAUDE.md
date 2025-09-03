# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (runs on http://localhost:5173)
- **Build**: `npm run build` (TypeScript check + Vite build)
- **Linting**: `npm run lint` (ESLint)
- **Testing**: `npm test` (Vitest watch mode), `npm run test:run` (single run)
- **Test coverage**: `npm run test:coverage`
- **Preview**: `npm run preview` (preview production build)

## Architecture Overview

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Firebase Authentication, Firestore Database
- **Build**: Vite
- **Testing**: Vitest, React Testing Library
- **PDF Export**: jsPDF, html2canvas

### Key Architectural Patterns

**Data Flow**: The app uses a hybrid local/cloud storage approach:
- Data is immediately saved to localStorage for offline functionality
- When authenticated, data is debounced-saved to Firestore (1 second delay)
- On load, tries Firestore first, falls back to localStorage
- Manual sync available via `forceSave()` in `useFoodLog` hook

**State Management**: React hooks pattern with custom hooks:
- `useAuth` - Firebase authentication state
- `useFoodLog` - Food log data with auto-sync
- `useExport` - Export functionality
- `useDateNavigation` - Date navigation state

**Component Structure**:
- `src/components/` - UI components organized by feature
- `src/pages/` - Route-level components
- `src/hooks/` - Custom React hooks
- `src/services/` - External service integrations (Firebase, export)
- `src/utils/` - Pure utility functions
- `src/types/` - TypeScript type definitions

### Firebase Configuration
App can run in two modes:
1. **Configured**: Full Firebase integration with authentication and cloud sync
2. **Unconfigured**: Local-only mode with localStorage persistence

Check `isFirebaseConfigured` in `src/services/firebase.ts` for current mode.

### Data Model
Core type is `FoodLog` with:
- Meals: breakfast, lunch, dinner (each with time + 7 food categories)
- Snacks: mid-morning, mid-day, nighttime
- Health metrics: bowel movements, exercise, water, sleep quality/hours, notes
- Auto-timestamps: createdAt, updatedAt

### Export System
Two-tier export system:
- `exportService.ts` - Core export logic (PDF generation, data formatting)
- `useExport.ts` - React hook for UI state management
- Supports date ranges and multiple formats (PDF, text)

### Key Files to Understand
- `src/hooks/useFoodLog.ts` - Core data management logic with error handling for Firestore index issues
- `src/services/firestore.ts` - Firestore operations with proper error handling
- `src/types/index.ts` - Complete type definitions
- `src/App.tsx` - Main app structure with auth modal and routing

### Testing Strategy
- Unit tests for utilities and services
- Integration tests for hooks
- Component tests for UI interactions
- Test files in `src/__tests__/`

## 🛡️ Quality Assurance Protocol

### **MANDATORY Visual Testing Requirements**

**CRITICAL**: After ANY styling, UI changes, or dependency updates, you MUST:

1. **Take Screenshots with Playwright MCP:**
   ```bash
   # Navigate to page and take screenshot
   mcp__playwright__browser_navigate -> http://localhost:5173
   mcp__playwright__browser_take_screenshot -> filename: "test-homepage.png"
   ```

2. **Verify Styles are Rendering:**
   - ✅ Check that fonts are NOT default serif (Times New Roman)
   - ✅ Verify colors, backgrounds, and gradients are visible
   - ✅ Confirm the page is NOT just black text on white background
   - ✅ Test bottom navigation tabs are styled and functional

3. **Test Multiple Viewports:**
   ```bash
   # Mobile viewport (iPhone)
   mcp__playwright__browser_resize -> width: 375, height: 667
   # Desktop viewport
   mcp__playwright__browser_resize -> width: 1920, height: 1080
   ```

### **Critical Pre-Commit Checks**

- [ ] **Visual Verification**: Take screenshots of main pages
- [ ] **Console Clean**: No errors in browser console
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **CSS Processing**: Tailwind classes are being applied (not raw CSS)
- [ ] **Navigation Test**: Bottom tabs work and highlight active state
- [ ] **Responsive Test**: Content doesn't overflow horizontally on mobile

### **Common Issues & Solutions**

**❌ Problem**: White page with default serif fonts
- **✅ Solution**: Check PostCSS and Tailwind CSS version compatibility

**❌ Problem**: Styles not applying after dependency changes
- **✅ Solution**: Restart dev server completely (`killall node` then `npm run dev`)

**❌ Problem**: Horizontal scrolling on mobile
- **✅ Solution**: Verify `overflow-x: hidden` in CSS and no fixed-width elements

### **Version Compatibility Warnings**

⚠️ **CRITICAL**: Never mix Tailwind CSS versions:
- **v3.x**: Uses traditional PostCSS config: `plugins: { tailwindcss: {}, autoprefixer: {} }`
- **v4.x** (alpha): Uses `@tailwindcss/postcss` package and different syntax
- **Always check `package.json` for version consistency**

### **Playwright MCP Testing Commands**

Essential commands for quality assurance:
```bash
# Basic navigation and screenshot
mcp__playwright__browser_navigate -> url: "http://localhost:5173"
mcp__playwright__browser_take_screenshot -> fullPage: true

# Check for console errors
mcp__playwright__browser_console_messages

# Test navigation
mcp__playwright__browser_click -> element: "Water tab", ref: "e642"

# Mobile viewport testing
mcp__playwright__browser_resize -> width: 375, height: 667
```

### **Prevention Checklist**

Before committing any changes:
1. 🔍 **Screenshot test**: Does the page look visually correct?
2. 🖥️ **Console check**: Any JavaScript errors?
3. 📱 **Mobile test**: Responsive design working?
4. 🏗️ **Build test**: `npm run build` successful?
5. 🎨 **Style test**: Tailwind classes rendering properly?