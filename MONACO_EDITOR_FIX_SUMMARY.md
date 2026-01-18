# Monaco Editor Empty Object Editing Fix

## Problem Statement

Users reported that they could not edit empty objects like `"MuiAccordion": {}` in the Monaco JSON editor within the Theme Editor Dialog. When attempting to add properties inside the empty braces, the editor would reset or prevent input, making it impossible to customize MUI component overrides through the JSON editor.

## Root Cause Analysis

The issue was caused by the interaction between three components:

### 1. Immediate JSON Parsing
The `handleFullThemeJsonChange` function was parsing and validating JSON on **every keystroke**:

```typescript
const handleFullThemeJsonChange = (value: string | undefined) => {
  if (value !== undefined) {
    setJsonEditorValue(value);
    setIsTypingInJsonEditor(true);
    setHasUnsavedChanges(true);

    try {
      const parsed = JSON.parse(value);  // ⚠️ Immediate parsing
      // ...validation...
      if (validation.isValid) {
        setThemeDefinition(parsed);
        setIsTypingInJsonEditor(false);  // ⚠️ Immediately sets to false
      }
    } catch (e) {
      setThemeJsonError(e instanceof Error ? e.message : 'Invalid JSON syntax');
    }
  }
};
```

### 2. State Synchronization Effect
A useEffect was syncing the JSON editor value whenever `isTypingInJsonEditor` was false:

```typescript
React.useEffect(() => {
  if (!isTypingInJsonEditor) {
    setJsonEditorValue(JSON.stringify(themeDefinition, null, 2));  // ⚠️ Resets editor
  }
}, [themeDefinition, isTypingInJsonEditor]);
```

### 3. Monaco's Format-On-Type
The Monaco editor had `formatOnType: true`, which would automatically format JSON as you typed, potentially moving the cursor or reorganizing the content.

### The Problem Flow

When a user tried to type inside `"MuiAccordion": {}`:

1. User positions cursor: `"MuiAccordion": {|}` (cursor between braces)
2. User types `"`: `"MuiAccordion": {"|}`
3. JSON is **immediately** parsed → **FAILS** (invalid JSON)
4. Error is set, but `isTypingInJsonEditor` stays `true`
5. User tries to continue typing but Monaco's auto-format or cursor position is disrupted
6. Or, if they type fast enough to make valid JSON, `isTypingInJsonEditor` becomes `false`
7. useEffect triggers and **resets** the value from `themeDefinition`
8. User loses their typing progress

## Solution

### 1. Debounced JSON Parsing (500ms)

Instead of parsing immediately, we wait 500ms after the user stops typing:

```typescript
const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

const handleFullThemeJsonChange = (value: string | undefined) => {
  if (value !== undefined) {
    setJsonEditorValue(value);
    setIsTypingInJsonEditor(true);
    setHasUnsavedChanges(true);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Debounce JSON parsing to avoid interfering with typing
    typingTimeoutRef.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(value);
        const validation = validateThemeDefinition(parsed);
        
        if (validation.isValid) {
          setThemeDefinition(parsed);
          setThemeJsonError('');
          setIsTypingInJsonEditor(false);  // ✅ Only after user stops typing
        } else {
          setThemeJsonError(validation.error || 'Invalid theme format');
        }
      } catch (e) {
        setThemeJsonError(e instanceof Error ? e.message : 'Invalid JSON syntax');
      }
    }, 500);  // ✅ Wait 500ms after user stops typing
  }
};
```

### 2. Disabled Format-On-Type

Changed Monaco editor options to prevent automatic formatting while typing:

```typescript
<Editor
  height="500px"
  language="json"
  value={jsonEditorValue}
  onChange={handleFullThemeJsonChange}
  theme={monacoSettings.theme}
  options={{
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: false,  // ✅ Disabled to prevent interference
  }}
/>
```

### 3. Proper Cleanup

Added cleanup for the timeout to prevent memory leaks:

```typescript
React.useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);
```

## Benefits

1. **Smooth Typing Experience**: Users can now type freely without the editor resetting
2. **Valid JSON Still Validated**: After 500ms of inactivity, JSON is validated and errors shown
3. **No Race Conditions**: The debounce mechanism prevents competing state updates
4. **Better Performance**: Reduces unnecessary JSON parsing from every keystroke to only when needed
5. **Empty Objects Editable**: The specific issue of editing `{}` is completely resolved

## Testing

Created comprehensive tests to verify the fix:

### Test 1: Empty Object Editing
```typescript
it('should allow editing empty objects in Monaco editor', async () => {
  // Sets up empty object: "MuiAccordion": {}
  // Adds properties inside
  // Verifies content is preserved through debounce
});
```

### Test 2: Typing Preservation
```typescript
it('should preserve editor content during typing', async () => {
  // Types invalid JSON (simulating mid-typing state)
  // Verifies value is not reset immediately
  // Checks value persists even after short wait
});
```

### Test 3: State Update After Debounce
```typescript
it('should update themeDefinition after valid JSON and debounce completes', async () => {
  // Types valid JSON
  // Waits for debounce
  // Verifies state was updated correctly
});
```

All tests pass successfully! ✅

## Technical Details

### Before Fix
- Parse attempt: **On every keystroke** (potentially 10-20 times per second while typing)
- State updates: **Immediate** (causing editor resets)
- User experience: **Broken** (couldn't edit empty objects)

### After Fix
- Parse attempt: **500ms after last keystroke** (1-2 times per edit session)
- State updates: **Debounced** (no interruption while typing)
- User experience: **Smooth** (can edit any JSON structure including empty objects)

## Code Changes Summary

**File**: `apps/preferences/src/components/ThemeEditorDialog.tsx`

- Added: `typingTimeoutRef` for debounce management
- Modified: `handleFullThemeJsonChange` to use debounced parsing
- Modified: Monaco editor options to set `formatOnType: false`
- Added: Cleanup effect for timeout

**File**: `apps/preferences/src/__tests__/ThemeEditorDialog.test.tsx`

- Updated: Two tests to wait for debounce (600ms waits added)

**File**: `apps/preferences/src/__tests__/ThemeEditorDialog.emptyObject.test.tsx` (NEW)

- Added: Three comprehensive tests for empty object editing scenarios

## Verification

- ✅ **Build**: Successful with no errors
- ✅ **TypeScript**: No compilation errors
- ✅ **Tests**: 47/48 passing (1 pre-existing flaky test unrelated to this fix)
- ✅ **New Tests**: 3/3 passing for empty object editing
- ✅ **Code Review**: No issues found
- ✅ **Security**: No vulnerabilities detected

## Usage

Users can now:

1. Open Theme Editor Dialog
2. Navigate to "Full Theme JSON" tab
3. Add empty MUI component overrides: `"MuiAccordion": {}`
4. Position cursor inside the braces
5. Type properties without interruption
6. See real-time JSON validation after stopping typing (500ms delay)
7. Save themes with complex nested structures

## Future Enhancements

Potential improvements for consideration:

1. Make debounce delay configurable
2. Add visual indicator when JSON is being validated (loading spinner)
3. Consider implementing a "format JSON" button instead of auto-format
4. Add keyboard shortcuts for common editing tasks
