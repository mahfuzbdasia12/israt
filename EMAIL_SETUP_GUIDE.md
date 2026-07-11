# Email Setup Guide

## Overview
The contact form on your portfolio website is now configured to send emails to **mahfuzislam6243@gmail.com** automatically when visitors submit the form.

## How to Set Up Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click on **Security** in the left sidebar
3. Scroll down to "How you sign in to Google"
4. Click **2-Step Verification** and follow the prompts

### Step 2: Generate App Password
1. Go back to **Security** settings
2. Scroll down and find **App passwords** (appears only after 2FA is enabled)
3. Select **Mail** and **Windows Computer** (or your device)
4. Google will generate a 16-character password
5. Copy this password (don't lose it!)

### Step 3: Update .env File
1. Open the `.env` file in your project root
2. Replace `your_app_password_here` with the 16-character password you copied:
   ```
   GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```
3. Save the file

## How the Contact Form Works

When a visitor fills out the contact form and clicks "Send Your Message":

1. **Email 1** - Sent to **mahfuzislam6243@gmail.com**:
   - Contains: Name, Email, WhatsApp, Selected Plan, Services, and Optional Message
   - Subject: "New Portfolio Inquiry from [Visitor Name]"

2. **Email 2** - Sent to the **visitor's email**:
   - Confirmation message thanking them for their inquiry
   - Includes their contact details and selected plan

3. **Form Response**:
   - Shows success/error message to the visitor
   - Resets the form fields

## Testing the Form

1. Start the server: `npm start`
2. Open http://localhost:3000
3. Fill out the contact form
4. Click "Send Your Message"
5. Check mahfuzislam6243@gmail.com for the inquiry email

## Troubleshooting

**Email not sending?**
- Check that 2FA is enabled on your Gmail account
- Verify the app password is correct in the .env file
- Check server console for any error messages
- Make sure `.env` file exists in the project root

**Getting "App passwords" option missing?**
- 2-Factor Authentication might not be fully enabled
- Wait a few minutes and try again
- Ensure you're using a regular Gmail account (not a business account with admin controls)

## Form Fields

The contact form collects:
- **Name** (required) - Visitor's full name
- **Email** (required) - Visitor's email address
- **WhatsApp** (required) - Contact phone number
- **Plan** (optional) - Selected service plan (Core SEO, AI-Driven SEO, or Enterprise)
- **Services** (optional) - Specific services of interest
- **Message** (optional) - Additional project details

## Email Templates

All emails are sent with HTML formatting and include:
- Professional styling
- All submitted information
- Call-to-action links (in confirmation email)
- Footer with sender identification

## Production Deployment

For deployment on a server:
1. Ensure `.env` file is uploaded to your server
2. Update `.env` with your production Gmail credentials
3. The email endpoint is at `POST /send-email`
4. All emails are sent asynchronously with error handling
