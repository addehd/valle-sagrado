# Stripe Subscription Management - TODO

## Phase 1: Basic Stripe Email Integration (Recommended Start)
- [ ] Enable Stripe Customer Portal in Dashboard
  - Go to: Settings → Billing → Customer portal
  - Configure allowed actions (cancel, pause, change plan)
  - Customize branding to match Danny's site
  
- [ ] Enable Stripe automatic emails
  - Settings → Emails → Customer emails
  - Enable "Successful payments" emails (includes portal link)
  - Enable "Upcoming invoice" emails
  - Customize email templates with Swedish text if possible

- [ ] Update checkout session to create/reuse customers
  - Replace `customer_email` with `customer` parameter
  - Search for existing customer by email before creating new one
  - Store customer ID for future reference

## Phase 2: Save Customer Data (Optional but Recommended)
- [ ] Create database table for subscription tracking
  ```sql
  -- customers table
  id, stripe_customer_id, email, name, phone, created_at
  
  -- subscriptions table  
  id, customer_id, stripe_subscription_id, package_id, status, created_at
  ```

- [ ] Store customer info after successful checkout
  - Save Stripe customer ID
  - Link to subscription ID
  - Track subscription status

- [ ] Set up Stripe webhook to track subscription changes
  - Handle `customer.subscription.created`
  - Handle `customer.subscription.updated`
  - Handle `customer.subscription.deleted`
  - Handle `invoice.payment_succeeded`
  - Handle `invoice.payment_failed`

## Phase 3: Custom "Hantera Prenumeration" Page (Future Enhancement)
- [ ] Create `/danny/hantera-prenumeration/+page.svelte`
  - Email input form
  - "Skicka länk" button
  - Success message after sending

- [ ] Create `/danny/hantera-prenumeration/+page.server.ts`
  - Action to find customer by email
  - Create billing portal session
  - Send magic link email

- [ ] Set up email service for magic links
  - Configure nodemailer/Resend/SendGrid
  - Create email template in Swedish
  - Include portal link with expiry notice

- [ ] Add link to "Hantera Prenumeration" page
  - In confirmation emails
  - In footer of Danny's site
  - In package purchase success page

## Phase 4: Testing
- [ ] Test subscription creation flow
  - Verify customer is created/reused correctly
  - Check Stripe customer portal access
  - Confirm emails are sent with portal links

- [ ] Test subscription management
  - Cancel subscription from portal
  - Update payment method
  - View billing history
  - Download invoices

- [ ] Test webhook handling (if implemented)
  - Verify status updates in database
  - Check failed payment handling
  - Test subscription cancellation flow

## Phase 5: Production Checklist
- [ ] Add `STRIPE_WEBHOOK_SECRET` to environment variables
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Set up monitoring for failed payments
- [ ] Add Swedish translations to Stripe dashboard
- [ ] Test with real payment in test mode
- [ ] Document customer support process for subscription issues

---

## Quick Wins (Do First)
1. Enable Stripe Customer Portal (5 minutes)
2. Enable automatic Stripe emails (5 minutes)
3. Update checkout to create customers (15 minutes)

## Notes
- Start with Option 1 (Stripe automatic emails) - zero dev work needed
- Option 2 (custom page) can be added later for better branding control
- Webhooks are important for keeping subscription status in sync
- Always test in Stripe test mode before going live
