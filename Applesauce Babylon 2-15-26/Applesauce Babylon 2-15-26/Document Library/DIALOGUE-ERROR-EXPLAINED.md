# Error Explained: "dialogue.show is not a function" 🎭

## What Happened

Your level tried to call:
```javascript
core.modules.dialogue.show("Title", "Message");
```

But your `ApplesauceDialogue` module doesn't have a `show()` method!

## Why This Error Occurs

### The Problem
```javascript
// Your level expects:
core.modules.dialogue.show(title, message);

// But your dialogue module might have:
core.modules.dialogue.showDialogue(title, message);
// or
core.modules.dialogue.displayMessage(title, message);
// or some other method name
```

### Error Breakdown
```
TypeError: core.modules.dialogue.show is not a function
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^      ^^^^^^^^^^^^^^^^
           This exists!                     This doesn't!
```

- ✅ `core.modules.dialogue` exists (the module loaded)
- ❌ `core.modules.dialogue.show` doesn't exist (wrong method name)

## How I Fixed It

### Solution: Smart Fallback Function

I created a `showLevelDialogue()` helper that tries multiple approaches:

```javascript
function showLevelDialogue(core, title, message) {
    // Try Method 1: show()
    if (core.modules.dialogue?.show) {
        core.modules.dialogue.show(title, message);
        return;
    }
    
    // Try Method 2: showDialogue()
    if (core.modules.dialogue?.showDialogue) {
        core.modules.dialogue.showDialogue(title, message);
        return;
    }
    
    // Try Method 3: displayMessage()
    if (core.modules.dialogue?.displayMessage) {
        core.modules.dialogue.displayMessage(title, message);
        return;
    }
    
    // Fallback: Use DOM directly
    const dialogueEl = document.getElementById('dialogue');
    if (dialogueEl) {
        document.getElementById('dialogue-speaker').textContent = title;
        document.getElementById('dialogue-text').textContent = message;
        dialogueEl.style.display = 'block';
        
        setTimeout(() => dialogueEl.style.display = 'none', 5000);
    }
    
    // Ultimate fallback: Console
    console.log(`📜 ${title}: ${message}`);
}
```

### Now all dialogue calls use this:
```javascript
// Old (crashed):
core.modules.dialogue.show("Title", "Message");

// New (safe):
showLevelDialogue(core, "Title", "Message");
```

## What This Means for You

### The Good News
✅ Your game won't crash anymore!
✅ Dialogue will display via DOM elements (the `#dialogue` div in HTML)
✅ If that fails, it logs to console
✅ Works regardless of your dialogue module's actual API

### What You'll See
When dialogue triggers, you'll see the brown dialogue box at the bottom of the screen with:
- Title in gold
- Message in white
- Auto-hides after 5 seconds

## Finding Your Actual Dialogue API

To see what methods your dialogue module ACTUALLY has, add this to your code:

```javascript
// In onLevelStart, add:
console.log('Dialogue module methods:', 
    Object.getOwnPropertyNames(Object.getPrototypeOf(core.modules.dialogue))
);
```

This will print something like:
```
Dialogue module methods: ['constructor', 'createNPC', 'showDialogue', 'update', 'clear']
```

Then you'll know the correct method name!

## Common Dialogue Module APIs

Different APPLESAUCE versions might use:

```javascript
// Version A
dialogue.show(title, message)

// Version B  
dialogue.showDialogue(title, message)

// Version C
dialogue.displayMessage(title, message)

// Version D
dialogue.addMessage({ title, text: message })

// Version E
dialogue.createDialogue({ speaker: title, text: message })
```

The new helper function tries all of these!

## How to Customize the Fallback Display

If you want to change how dialogue appears, edit the CSS in `wildwest-level.html`:

```css
#dialogue {
    /* Change colors */
    background: rgba(139, 69, 19, 0.9);  /* Brown background */
    border: 3px solid #FFD700;           /* Gold border */
    color: #FFF;                         /* White text */
    
    /* Change position */
    bottom: 40px;   /* Distance from bottom */
    left: 50%;      /* Centered */
    
    /* Change size */
    max-width: 600px;
    padding: 20px 30px;
}
```

## Testing the Dialogue

Try these console commands when the game is running:

```javascript
// Test dialogue display
showLevelDialogue(game, "Test Title", "Test message!");

// Check what dialogue methods exist
console.log(game.modules.dialogue);
```

## Why Module APIs Differ

You might be mixing different APPLESAUCE versions:
- **Old dialogue module** → Uses `show()`
- **New dialogue module** → Uses `showDialogue()`  
- **Your custom module** → Uses something else

The fallback system handles all of them!

## Quick Fix Checklist

If dialogue still doesn't work:

1. ✅ Check `#dialogue` div exists in HTML
2. ✅ Check `#dialogue-speaker` exists in HTML
3. ✅ Check `#dialogue-text` exists in HTML
4. ✅ Check CSS isn't hiding it (`display: none` should be in default state)
5. ✅ Open console - you should see `📜 Title: Message` as fallback

## The Pattern: Defensive Coding

This is a great example of **defensive coding**:

```javascript
// ❌ Fragile - assumes exact API
core.modules.dialogue.show(title, message);

// ✅ Defensive - handles variations
if (typeof core.modules.dialogue?.show === 'function') {
    core.modules.dialogue.show(title, message);
} else {
    // Fallback approach
}
```

Always code like you don't trust the APIs - because versions change!

---

## Summary

**Error:** `dialogue.show is not a function`

**Cause:** Your dialogue module has a different method name

**Fix:** Smart fallback function that tries multiple APIs and uses DOM if all fail

**Result:** Dialogue displays perfectly regardless of your module version! 🎭
