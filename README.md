# RTL Toggle for Claude.ai - Chrome Extension

![Demo](demo.gif)

<div dir="rtl">

## עברית

תוסף Chrome להחלפת כיוון טקסט (RTL/LTR) בצ'אט של Claude.ai.

### תכונות

- **כפתור החלפת כיוון** - מוסיף כפתור ליד כל הודעה וכל בלוק קוד (`<pre>`)
- **תמיכה בעברית, ערבית ופרסית** - מושלם לשפות RTL
- **החלפה עצמאית** - כל הודעה/בלוק קוד ניתן להחלפה בנפרד
- **תמיכה בטבלאות** - מיישר גם תאי טבלה (`th`, `td`) בתוך בלוקי קוד
- **שומר על תפריטים** - סרגלי הפעולה (כפתורי העתקה וכו') נשארים תמיד LTR

### התקנה

1. פתח את Chrome ונווט אל `chrome://extensions/`
2. הפעל "מצב מפתח" (Developer mode) בפינה הימנית העליונה
3. לחץ על "טען תוסף לא ארוז" (Load unpacked)
4. בחר את התיקייה המכילה את קבצי התוסף
5. גלוש אל https://claude.ai/ והתוסף יפעל אוטומטית

### שימוש

1. שלח הודעה לקלוד
2. חפש את כפתור החלפת הכיוון בצד שמאל של ההודעה
3. לחץ על הכפתור להחלפה בין RTL ל-LTR
4. לבלוקי קוד - יש כפתור נפרד לכל בלוק

</div>

---

## English

A Chrome extension to toggle text direction (RTL/LTR) in Claude.ai chat messages and code blocks.

### Features

- **Direction Toggle Button** - Adds a button next to each message and code block (`<pre>`)
- **RTL Language Support** - Perfect for Hebrew, Arabic, Persian, and other RTL languages
- **Independent Toggling** - Each message/code block can be toggled separately
- **Table Support** - Also aligns table cells (`th`, `td`) inside code blocks
- **Preserves Action Bars** - Copy buttons and action menus always stay LTR

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top right corner
3. Click "Load unpacked"
4. Select the folder containing this extension's files
5. Navigate to https://claude.ai/ and the extension will work automatically

### Usage

1. Send a message to Claude
2. Look for the direction toggle button on the left side of each message
3. Click the button to toggle between RTL and LTR
4. For code blocks - each block has its own separate toggle button

### Files

- `manifest.json` - Extension configuration
- `content.js` - Content script that adds toggle buttons and handles direction switching
- `README.md` - This file

### License

MIT
