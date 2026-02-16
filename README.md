# GitHub Copilot Workshop for Commit AI Customers

**Legal Disclaimer:**

This repository contains proprietary workshop code and materials. The contents are the intellectual property of Commit AI and are provided solely for the purposes of the associated workshop by paying customers. 

**You may not use, copy, distribute, or share any part of this code or its contents without explicit written consent from Commit AI.**

## React Hooks Documentation

The application uses the following React hooks:

### `useState`
Manages component state. Used for:
- `superheroes`: Array of fetched superhero data
- `selectedHeroes`: Array of up to 2 selected heroes for comparison
- `currentView`: Toggle between 'table' and 'comparison' views
- `narration`: Battle narration text content
- `narrationLoading`: Loading state for narration generation
- `narrationError`: Error message for failed narration requests
- `narrationKey`: Key to trigger re-animation on narration updates
- `searchQuery`: Current search input value
- `searchLoading`: Loading state for search requests

### `useEffect`
Performs side effects. Used for:
- Initial load of the full superhero list on component mount

### `useRef`
Maintains mutable reference that persists across renders. Used for:
- `debounceRef`: Debounce timer reference for search input to delay API calls (300ms)

### `useCallback`
Memoizes function to prevent unnecessary re-renders. Used for:
- `fetchHeroes`: Function to fetch superheroes from API (full list or search results) with dependency on empty array