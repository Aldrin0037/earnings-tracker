# Google Sheets + n8n Integration Setup

## 🚀 Overview

This guide will help you integrate your Earnings Tracker with:
- **Google Sheets** - Automatic backup and sync of all your earnings data
- **n8n** - Powerful automation workflows and AI agents

## Architecture

```
Next.js App (localStorage)
    ↓
    ├─→ Google Sheets (Cloud Backup)
    └─→ n8n Webhook
          ├─→ Data Sync Workflow
          └─→ AI Agent with Gemini
```

---

## Part 1: Google Sheets Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Earnings Tracker Data"
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable "Google Sheets API":
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

### Step 4: Configure Your App

Add to your `.env.local` file:

```env
# Google Sheets Integration
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Step 5: Test the Connection

1. Restart your development server
2. Go to Settings page in your app
3. Look for "Cloud Integrations" section
4. Click "Sync Now" to test the connection
5. Check your Google Sheet - you should see your data!

---

## Part 2: n8n Setup

### Step 1: Install n8n

Choose one of these methods:

**Option A: Cloud (Easiest)**
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Get instant access to n8n

**Option B: Self-Hosted with Docker**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

**Option C: NPM**
```bash
npm install n8n -g
n8n start
```

Access n8n at: `http://localhost:5678`

### Step 2: Import Workflows

1. In n8n, go to "Workflows"
2. Click "Import from File"
3. Import both workflows from `n8n-workflows/` folder:
   - `01-data-sync-workflow.json`
   - `02-ai-agent-gemini-workflow.json`

### Step 3: Configure Data Sync Workflow

1. Open "Earnings Tracker - Data Sync" workflow
2. Click on "Webhook Trigger" node
3. Copy the "Production URL"
4. Update the following nodes:
   - **Google Sheets node**: Add your Google Sheets credentials
   - **Spreadsheet ID**: Set to your spreadsheet ID

5. Click "Activate" to enable the workflow

### Step 4: Configure AI Agent Workflow

1. Open "Earnings Tracker - AI Agent with Gemini" workflow
2. Configure these nodes:
   - **AI Webhook Trigger**: Copy the webhook URL
   - **Gemini AI node**: Add your Gemini API credentials
   - **Fetch Earnings Records**: Update APP_URL to your app URL

3. Click "Activate" to enable the workflow

### Step 5: Connect Your App to n8n

Add to your `.env.local`:

```env
# n8n Webhook URL
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/earnings-sync

# Optional: AI Agent webhook
NEXT_PUBLIC_N8N_AI_WEBHOOK_URL=https://your-n8n-instance.com/webhook/earnings-ai-agent
```

---

## Part 3: Testing the Integration

### Test Google Sheets Sync

1. Go to your app's Settings page
2. Click "Sync Now" under Cloud Integrations
3. Check your Google Sheet - data should appear
4. Add a new record in your app
5. Sync again - new record should appear

### Test n8n Webhook

1. In Settings, click "Test Webhook" under n8n Automation
2. Check n8n execution log - should show successful execution
3. Check Google Sheet - should have a new entry from the webhook

### Test AI Agent (Optional)

If you set up the AI Agent workflow:

1. Use the AI Chat in your app
2. Ask a question like "What did I earn yesterday?"
3. The AI will process through n8n and Gemini
4. Check n8n execution log for the AI agent workflow

---

## Features Enabled

### ✅ With Google Sheets Integration

- **Automatic Cloud Backup** - All your data is backed up
- **Access Anywhere** - View data in Google Sheets on any device
- **Data Analysis** - Use Google Sheets features (charts, formulas, pivot tables)
- **Export** - Download as Excel, PDF, CSV
- **Collaboration** - Share with accountants or team members

### ✅ With n8n Integration

- **Automated Sync** - Data syncs automatically on changes
- **AI-Powered Insights** - Gemini AI analyzes your earnings
- **Custom Workflows** - Build your own automation
- **Scheduled Reports** - Get daily/weekly earnings reports
- **Multi-platform Notifications** - Slack, Email, SMS, etc.
- **Advanced Analytics** - Combine with other data sources

---

## Example n8n Workflows You Can Build

### 1. Daily Earnings Report

- **Trigger**: Schedule (every day at 9 AM)
- **Action**: Fetch yesterday's earnings
- **Output**: Send email with summary

### 2. Low Balance Alert

- **Trigger**: Webhook (when record is added)
- **Condition**: If remaining balance < ₱500
- **Action**: Send Slack/Email notification

### 3. Weekly Analytics

- **Trigger**: Schedule (every Monday)
- **Action**: Calculate weekly stats, trends, predictions
- **Output**: Generate PDF report and email it

### 4. Expense Tracking Integration

- **Trigger**: New expense in Google Sheets
- **Action**: Update advance balance
- **Output**: Sync back to app

### 5. AI-Powered Predictions

- **Trigger**: End of month
- **Action**: Use Gemini to analyze trends and predict next month
- **Output**: Send insights report

---

## Troubleshooting

### Google Sheets Sync Fails

**Error: "API key not valid"**
- Check that your API key is correct in `.env.local`
- Make sure Google Sheets API is enabled in Cloud Console
- Try creating a new API key

**Error: "Permission denied"**
- Make sure the spreadsheet is not private
- Check sharing settings in Google Sheets
- Or use OAuth2 authentication instead of API key

### n8n Webhook Not Receiving Data

**No data appearing in n8n:**
- Check that webhook URL in `.env.local` is correct
- Make sure n8n workflow is activated
- Check n8n executions log for errors
- Test webhook URL with Postman or curl

**Webhook times out:**
- Check your n8n instance is accessible from your app
- If self-hosted, ensure port is open
- Try using ngrok for local development

### AI Agent Not Working

**Gemini API errors:**
- Verify Gemini API key is correct
- Check API quota/limits
- Make sure you're using correct model name (`gemini-1.5-flash`)

**No response from AI:**
- Check n8n AI Agent workflow is activated
- Verify APP_URL is set correctly in workflow
- Check n8n execution logs for errors

---

## Environment Variables Reference

### Required for Google Sheets

```env
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Required for n8n

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/earnings-sync
```

### Optional

```env
# For AI Agent workflow
NEXT_PUBLIC_N8N_AI_WEBHOOK_URL=https://your-n8n-instance.com/webhook/earnings-ai-agent
```

---

## Security Best Practices

1. **Never commit `.env.local`** to git
2. **Use environment variables** for all sensitive data
3. **Restrict API key permissions** to only Google Sheets API
4. **Use webhook authentication** in production (add API key header)
5. **Enable HTTPS** for n8n webhooks
6. **Regularly rotate API keys**

---

## Cost Estimates

### Google Sheets API
- **Free Tier**: 500 requests per 100 seconds per project
- **Cost**: Free for typical personal use
- **Paid**: $0.40 per 1,000 requests (after free tier)

### n8n
- **Cloud**: Starting at $20/month
- **Self-Hosted**: Free (requires server/hosting)
- **Resource Usage**: ~512MB RAM for basic workflows

### Gemini AI
- **Free Tier**: 60 requests per minute
- **Paid**: ~$0.00035 per 1,000 tokens
- **Typical Cost**: < $1/month for personal use

---

## Next Steps

1. ✅ Set up Google Sheets sync
2. ✅ Install and configure n8n
3. ✅ Import and activate workflows
4. 🚀 Build custom automations
5. 📊 Analyze your earnings data
6. 🤖 Enhance AI agent capabilities

## Support

- **n8n Docs**: https://docs.n8n.io
- **Google Sheets API**: https://developers.google.com/sheets
- **Gemini API**: https://ai.google.dev/docs

---

**Congratulations! 🎉** Your Earnings Tracker is now supercharged with cloud sync and AI automation!
