# AI Coach Integration Guide

## Overview
This guide explains how the AI coach booking and lead generation features work and how to customize them for your needs.

## Features

### 1. Booking System

#### How Users Book Consultations
1. Click any "Apply for Consultation" or "Start Your Transformation" button
2. Complete 3-step booking form:
   - **Step 1**: Personal information (name, email, phone, goal)
   - **Step 2**: Select date and time from available slots
   - **Step 3**: Review and confirm booking
3. Automatically redirected to external booking system

#### AI-Triggered Bookings
The AI coach can trigger bookings automatically when it detects user intent:

```typescript
// Example AI responses that trigger booking:
"I want to book a consultation"
"Can I schedule a call?"
"When can we meet?"
"How do I sign up?"
```

When detected, the AI:
1. Calls the `book_consultation` function
2. Returns a special marker: `[BOOKING_REQUEST]{...data}`
3. The UI detects this marker and opens the booking modal
4. Any user info from the conversation is prefilled

#### Customizing the Booking URL
Edit `services/bookingService.ts`:

```typescript
// Change this line to your Cal.com or Calendly URL:
const bookingUrl = 'https://tinyurl.com/bookptd';
// To: const bookingUrl = 'https://cal.com/your-username';
```

#### Integrating with Cal.com API
To use Cal.com API directly instead of redirect:

```typescript
import { CalApi } from '@calcom/api';

export const createBooking = async (bookingData: BookingData) => {
  const calApi = new CalApi({ apiKey: process.env.CAL_API_KEY });
  
  const booking = await calApi.bookings.create({
    eventTypeId: YOUR_EVENT_TYPE_ID,
    start: `${bookingData.date}T${bookingData.time}:00`,
    responses: {
      name: bookingData.name,
      email: bookingData.email,
      notes: bookingData.notes,
    }
  });
  
  return {
    success: true,
    bookingId: booking.id,
    confirmationUrl: booking.url,
  };
};
```

### 2. Lead Generation System

#### How Leads are Captured
Leads can be captured in three ways:

1. **Direct Form Submission**
   - User fills out lead capture form on main page
   - Located in the "Contact" section

2. **Through Booking**
   - When user books, lead is automatically created
   - Includes all booking information

3. **Via AI Conversation**
   - AI detects user information during chat
   - Calls `capture_lead` function automatically
   - User info extracted from conversation

#### Lead Scoring
Leads are automatically scored (0-100) based on:

- **+20 points**: Phone number provided
- **+20 points**: Detailed goal description (>10 characters)
- **+30 points**: Target age range (40-50)
- **+30 points**: Location is Dubai/UAE

Leads with score ≥50 are marked as "qualified" automatically.

#### Accessing Lead Data

**In Browser Console:**
```javascript
// Get all leads
const leads = JSON.parse(localStorage.getItem('leads') || '[]');

// Get qualified leads only
const qualified = leads.filter(l => l.qualified);

// Export leads as CSV
console.table(leads);
```

**In Code:**
```typescript
import { getAllLeads, getQualifiedLeads } from './services/leadService';

// Get all leads
const allLeads = getAllLeads();

// Get qualified leads
const qualifiedLeads = getQualifiedLeads();

// Update lead status
updateLeadStatus('LEAD-123456', 'contacted');
```

### 3. AI Coach Configuration

#### System Prompt
The AI is configured with booking-awareness in `services/geminiService.ts`:

```typescript
const prompt = `
  You are the **Antigravity Habit Agent** with booking and lead generation capabilities.
  Goal: Build trust via "Micro-Wins" and guide users to book consultations.
  
  When users express interest in booking or want personalized help, 
  suggest using the booking system.
`;
```

#### Function Declarations
Two functions are available to the AI:

1. **book_consultation**: Triggers when user wants to book
2. **capture_lead**: Saves lead info from conversation

## Backend Integration

### Setting Up Backend API

Replace localStorage with API calls:

```typescript
// In services/leadService.ts
export const createLead = async (leadData: LeadInput): Promise<Lead> => {
  // Instead of localStorage:
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  
  return response.json();
};
```

### Recommended Backend Stack

**Option 1: Supabase**
```bash
npm install @supabase/supabase-js
```

**Option 2: Firebase**
```bash
npm install firebase
```

**Option 3: Custom API**
- Node.js + Express
- PostgreSQL/MongoDB
- RESTful or GraphQL

## Environment Variables

Create a `.env.local` file:

```env
# Gemini AI (required)
GEMINI_API_KEY=your_gemini_api_key

# Cal.com (optional)
CAL_API_KEY=your_cal_api_key
CAL_EVENT_TYPE_ID=your_event_type_id

# Backend API (optional)
API_URL=https://your-api.com
API_KEY=your_api_key
```

## Testing

### Test Booking Flow
1. Click "Apply for Consultation"
2. Fill in form with test data
3. Select any available date/time
4. Confirm and verify redirect

### Test AI Booking
1. Open Studio (AI chat)
2. Type: "I want to book a consultation"
3. Verify booking modal opens
4. Check prefilled data

### Test Lead Capture
1. Fill out lead capture form
2. Check browser console:
   ```javascript
   localStorage.getItem('leads')
   ```
3. Verify lead data is stored

## Customization

### Styling
All components use Tailwind CSS. Customize in `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        accent: '#YOUR_COLOR', // Change CTA color
        primary: '#YOUR_COLOR', // Change text color
      }
    }
  }
}
```

### Form Fields
Add custom fields in `components/BookingModal.tsx`:

```typescript
// Add to formData state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  goal: '',
  notes: '',
  customField: '', // Add your field
});

// Add input in form
<input
  name="customField"
  value={formData.customField}
  onChange={handleInputChange}
  placeholder="Your custom field"
/>
```

### Lead Scoring Rules
Modify scoring in `services/leadService.ts`:

```typescript
const calculateLeadScore = (lead: LeadInput): number => {
  let score = 0;
  
  // Add your custom rules:
  if (lead.companySize === 'enterprise') score += 40;
  if (lead.budget > 10000) score += 30;
  // etc.
  
  return Math.min(score, 100);
};
```

## Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test in incognito mode (clears localStorage)
4. Review this guide for configuration steps

## Best Practices

1. **Always validate user input** before storing
2. **Use HTTPS** for all API calls
3. **Implement rate limiting** on booking endpoints
4. **Send confirmation emails** after booking
5. **Back up lead data** regularly
6. **Monitor lead quality** and adjust scoring
7. **A/B test** booking flows for optimization

## Next Steps

1. Set up backend API for permanent storage
2. Configure email notifications
3. Integrate with your CRM
4. Add analytics tracking
5. Implement lead nurturing workflows
6. Create admin dashboard for lead management
