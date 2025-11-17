# AI Chat Assistant Setup

## 🤖 Features

Your earnings tracker now includes an **AI Chat Assistant** powered by Google Gemini!

### What it can do:

- ✅ **Answer questions** about your earnings history
- ✅ **Add records** through voice or text commands
- ✅ **Delete records** with confirmation
- ✅ **Analyze trends** and provide insights
- ✅ **Voice input** - talk to your app!
- ✅ **Remember everything** - all your records and conversations

## 🚀 Quick Setup

### 1. Get a FREE Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

**Note:** The free tier includes:
- 60 requests per minute
- Perfect for personal use
- No credit card required!

### 2. Add API Key to Your App

1. Create a file named `.env.local` in the root folder (same level as package.json)
2. Add this line:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key

**Example:**
```
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyABC123XYZ789example_key_here
```

### 3. Restart the App

1. Stop the development server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. The AI chat button should now appear in the bottom-right corner!

## 💬 How to Use

### Text Commands

Click the chat button (💬) in the bottom-right corner and try:

**Questions:**
- "What did I earn yesterday?"
- "Show me my total earnings this week"
- "What's my best day this month?"
- "When was the last time I added a record?"

**Add Records:**
- "Add 5 bookings for today"
- "Create an entry for November 15th with 8 bookings"
- "I had 3 bookings today with note: busy afternoon"

**Delete Records:**
- "Delete today's record"
- "Remove the entry from yesterday"

**Analysis:**
- "What's my average daily earnings?"
- "Show me trends from last week"
- "When will my advance be paid off?"

### 🎤 Voice Commands

1. Click the microphone button (🎤)
2. Speak your command
3. The AI will transcribe and respond!

**Supported browsers:** Chrome, Edge, Safari

## 🛠️ Troubleshooting

### "Gemini API not configured" error
- Make sure you created the `.env.local` file
- Check that your API key is correct
- Restart the development server

### Voice input not working
- Use Chrome, Edge, or Safari (Firefox doesn't support speech recognition)
- Allow microphone permissions when prompted
- Make sure you're on HTTPS (or localhost)

### API Rate Limits
- Free tier: 60 requests/minute
- If you hit the limit, wait a minute and try again
- Consider upgrading to paid tier if needed (very cheap!)

## 💰 Cost

**Free Tier:**
- 60 requests per minute
- ~1800 requests per hour
- **Cost: $0** (completely free!)

**Paid Tier (if needed):**
- Gemini Pro: $0.00035 per 1000 tokens
- **Example:** 1000 chats ≈ $0.35

## 🔒 Privacy

- All chat history is stored locally in your browser
- Only your message and necessary earnings data is sent to Gemini
- No personal data is stored on Gemini's servers
- You can clear chat history anytime (trash icon)

## 🎯 Example Conversations

**User:** "What did I earn last Monday?"

**AI:** "On Monday, November 11th, you earned ₱650.00 with 8 bookings and 1 inquiry."

---

**User:** "Add 3 bookings for today"

**AI:** "I'll add an entry for today with 3 bookings. You'll earn ₱350.00. Should I proceed?"

**User:** "Yes"

**AI:** "✅ Done! Entry added. Your remaining advance balance is now ₱1,636.00"

---

**User (voice):** *"Show me my best earning day this month"*

**AI:** "Your best day was November 15th with ₱850.00 from 12 bookings!"

## 📝 Notes

- The AI remembers all your earnings records
- It can see when you added each record
- It knows your current settings (base pay, booking rate, etc.)
- It provides context-aware answers based on your actual data

Enjoy your AI-powered earnings tracker! 🎉
