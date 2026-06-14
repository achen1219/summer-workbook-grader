# Summer Workbook Grader

Open `index.html` in a browser to try the prototype.

For your daughter's own device without AI grading, the simplest path is:
1. Put this `workbook-grader` folder on her device.
2. Open `index.html` in Chrome, Edge, or Safari.
3. Use the browser's "Add to Home Screen" or "Install app" option if available.
4. Keep using the same device and browser so progress stays there.

No login is required. Progress is stored locally in that browser on that device.

## AI photo grading trial

To let her open a website and upload worksheet photos for grading, host this folder through Vercel. The website can stay public, but the OpenAI API key must stay private in Vercel.

Recommended trial budget:
- Set an OpenAI monthly budget cap of `$10`.
- Use `gpt-5.4-mini` for the first test.
- Keep worksheet images resized/compressed before sending them.
- Treat low-confidence answers as "parent check," not wrong.

Vercel environment variables:
- `OPENAI_API_KEY`: your OpenAI API key.
- `OPENAI_VISION_MODEL`: optional, defaults to `gpt-5.4-mini`.

How the hosted version works:
1. Your daughter opens the hosted site.
2. She uploads a worksheet photo.
3. The browser sends the photo to `/api/grade-page`.
4. The private helper calls OpenAI Vision.
5. The app shows correct, incorrect, and parent-check answers.
6. Progress stays in her browser on that device.

What works now:
- Upload answer-key photos and completed workbook photos.
- Keep an editable structured math answer key.
- Run demo math grading and see correct/incorrect totals.
- Paste a writing sample and get encouraging feedback.
- View a parent summary for completed sets, accuracy, review items, and writing work.
- Call a private hosted grading helper when deployed with an OpenAI API key.

What still needs a production backend:
- Testing photo grading on real workbook pages.
- Reading answer-key photos into structured keys automatically.
- Optional photo processing if you want the app to grade directly from images.
- Optional export/import if you want to move progress between devices.
- More precise writing feedback from an AI model.

Recommended next build step:
Put this project in GitHub, import it into Vercel, add `OPENAI_API_KEY`, and run a small test with 3-5 worksheet pages before letting her upload a full week of work.
