# ZeptoMail + React Email - Implementation Guide for Other Repos

Complete guide to replicate the ZeptoMail email system in a new project.

---

## 1. Install Dependencies

```bash
npm install zeptomail @react-email/components react-email
```

---

## 2. Environment Variables

```env
ZEPTOMAIL_TOKEN=your_zeptomail_api_key_here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name
```

- Get your token from [ZeptoMail dashboard](https://zeptomail.zoho.com/)
- The token is auto-prefixed with `Zoho-enczapikey` if not already present
- When `ZEPTOMAIL_TOKEN` is missing, all sends are no-ops (returns `{ success: true, data: { mock: true } }`) -- safe for local dev

---

## 3. Config Entry Point

Add a `zeptomail` block to your app config:

```typescript
// src/config.ts (or wherever your config lives)

const config = {
  // ... other config
  zeptomail: {
    token: process.env.ZEPTOMAIL_TOKEN || '',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Your App',
  },
};

export default config;
```

---

## 4. Core Files

Create the directory `src/lib/react-email/` with these files:

### 4.1 `types.ts` -- Shared Types

```typescript
// src/lib/react-email/types.ts

export interface ZeptoMailSendOptions {
  to: string | string[];
  subject: string;
  htmlbody: string;
  textbody?: string;
  attachments?: ZeptoMailAttachment[];
}

export interface ZeptoMailAttachment {
  name: string;
  content: string; // base64-encoded
  mime_type: string;
}

export interface EmailSendResult {
  success: boolean;
  data?: unknown;
  error?: unknown;
}
```

### 4.2 `zeptoClient.ts` -- ZeptoMail Client (Lazy Singleton)

```typescript
// src/lib/react-email/zeptoClient.ts

// IMPORTANT: Must use require() -- the ZeptoMail SDK exports SendMailClient
// as a function (not a class), so ES import causes TS errors.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SendMailClient } = require('zeptomail');
import config from '@/config';

interface ZeptoMailClient {
  sendMail(options: Record<string, unknown>): Promise<unknown>;
}

let client: ZeptoMailClient | null = null;

/**
 * Get or create the ZeptoMail SendMailClient instance.
 * Lazily initialized on first call.
 */
export function getEmailClient(): ZeptoMailClient {
  if (!config.zeptomail.token) {
    throw new Error(
      'ZEPTOMAIL_TOKEN is not configured. Please add it to your environment variables.'
    );
  }

  if (!client) {
    const token = config.zeptomail.token.startsWith('Zoho-enczapikey')
      ? config.zeptomail.token
      : `Zoho-enczapikey ${config.zeptomail.token}`;

    client = new SendMailClient({
      url: 'https://api.zeptomail.com/v1.1/email',
      token,
    }) as ZeptoMailClient;
  }

  return client;
}

/**
 * Check if ZeptoMail service is configured
 */
export function isZeptoMailConfigured(): boolean {
  return !!config.zeptomail.token;
}

/**
 * Get the from address config
 */
export function getFromAddress(): { address: string; name: string } {
  return {
    address: config.zeptomail.fromAddress,
    name: config.zeptomail.fromName,
  };
}
```

### 4.3 `render.ts` -- React Email Renderer

```typescript
// src/lib/react-email/render.ts

import { render } from '@react-email/components';
import type { ReactElement } from 'react';

/**
 * Render a React Email component to an HTML string.
 */
export async function renderToHtml(element: ReactElement): Promise<string> {
  return render(element);
}

/**
 * Render a React Email component to a plain text string.
 */
export async function renderToText(element: ReactElement): Promise<string> {
  return render(element, { plainText: true });
}
```

### 4.4 `sendZepto.ts` -- Send Functions

```typescript
// src/lib/react-email/sendZepto.ts

import type { ReactElement } from 'react';
import { getEmailClient, getFromAddress, isZeptoMailConfigured } from './zeptoClient';
import { renderToHtml, renderToText } from './render';
import type { EmailSendResult, ZeptoMailAttachment } from './types';

interface SendEmailViaZeptoOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  attachments?: ZeptoMailAttachment[];
}

/**
 * Send an email using ZeptoMail with a React Email template.
 * Renders the React component to HTML + plain text, then sends via ZeptoMail API.
 */
export async function sendEmailViaZepto({
  to,
  subject,
  react,
  attachments,
}: SendEmailViaZeptoOptions): Promise<EmailSendResult> {
  if (!isZeptoMailConfigured()) {
    console.warn('ZeptoMail not configured. Email would be sent to:', to);
    return { success: true, data: { mock: true } };
  }

  try {
    const client = getEmailClient();
    const from = getFromAddress();

    const htmlbody = await renderToHtml(react);
    const textbody = await renderToText(react);

    const toAddresses = (Array.isArray(to) ? to : [to]).map((address) => ({
      email_address: { address, name: address },
    }));

    const response = await client.sendMail({
      from: {
        address: from.address,
        name: from.name,
      },
      to: toAddresses,
      subject,
      htmlbody,
      textbody,
      ...(attachments && attachments.length > 0 && { attachments }),
    });

    console.log('ZeptoMail email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send email via ZeptoMail:', error);
    return { success: false, error };
  }
}

/**
 * Send a raw HTML email via ZeptoMail (no React rendering).
 * Useful for simple emails that don't need templates.
 */
export async function sendRawEmailViaZepto({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: ZeptoMailAttachment[];
}): Promise<EmailSendResult> {
  if (!isZeptoMailConfigured()) {
    console.warn('ZeptoMail not configured. Email would be sent to:', to);
    return { success: true, data: { mock: true } };
  }

  try {
    const client = getEmailClient();
    const from = getFromAddress();

    const toAddresses = (Array.isArray(to) ? to : [to]).map((address) => ({
      email_address: { address, name: address },
    }));

    const response = await client.sendMail({
      from: {
        address: from.address,
        name: from.name,
      },
      to: toAddresses,
      subject,
      htmlbody: html,
      ...(text && { textbody: text }),
      ...(attachments && attachments.length > 0 && { attachments }),
    });

    console.log('ZeptoMail raw email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send raw email via ZeptoMail:', error);
    return { success: false, error };
  }
}
```

### 4.5 `index.ts` -- Barrel Exports

```typescript
// src/lib/react-email/index.ts

// Client
export { getEmailClient, isZeptoMailConfigured, getFromAddress } from './zeptoClient';

// Send functions
export { sendEmailViaZepto, sendRawEmailViaZepto } from './sendZepto';

// Render utilities
export { renderToHtml, renderToText } from './render';

// Types
export type { ZeptoMailSendOptions, ZeptoMailAttachment, EmailSendResult } from './types';

// Templates (add your own here)
// export { WelcomeEmail } from './templates/WelcomeEmail';
// export { TestEmail } from './templates/TestEmail';
```

---

## 5. Shared Template Components

Create `src/lib/react-email/templates/components/` with these reusable pieces:

### 5.1 `BaseLayout.tsx` -- Root Email Wrapper

```tsx
// src/lib/react-email/templates/components/BaseLayout.tsx

import {
  Html, Head, Body, Container, Section, Text,
  Preview, Hr, Img, Tailwind,
} from '@react-email/components';
import type { ReactNode } from 'react';

interface BaseLayoutProps {
  preview: string;
  children: ReactNode;
  footerText?: string;
}

export const BaseLayout = ({
  preview,
  children,
  footerText = 'Your App Name',
}: BaseLayoutProps) => {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="mx-auto my-0 bg-white font-sans">
          <Container className="mx-auto max-w-[600px] px-6 py-5">
            {/* Logo header -- replace with your own */}
            <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
              <tr>
                <td className="pr-2.5 align-middle">
                  <Img
                    src="https://yourdomain.com/logo.png"
                    width="28"
                    height="28"
                    alt=""
                    className="block rounded"
                  />
                </td>
                <td className="align-middle">
                  <span className="text-base font-semibold text-gray-800">
                    Your App Name
                  </span>
                </td>
              </tr>
            </table>

            <Hr className="my-4 border-gray-200" />

            <Section>{children}</Section>

            <Hr className="my-4 border-gray-200" />

            <Text className="m-0 text-xs text-gray-400">{footerText}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
```

### 5.2 `ActionButton.tsx` -- CTA Button

```tsx
// src/lib/react-email/templates/components/ActionButton.tsx

import { Button } from '@react-email/components';

interface ActionButtonProps {
  href: string;
  label: string;
  backgroundColor?: string;
}

export const ActionButton = ({
  href,
  label,
  backgroundColor = '#556cd6',
}: ActionButtonProps) => {
  return (
    <Button
      href={href}
      style={{
        backgroundColor,
        borderRadius: '5px',
        color: '#fff',
        display: 'block',
        fontSize: '16px',
        fontWeight: 'bold' as const,
        padding: '10px',
        textAlign: 'center' as const,
        textDecoration: 'none',
      }}
    >
      {label}
    </Button>
  );
};
```

### 5.3 `InfoBox.tsx` -- Info Card with Key-Value Items

```tsx
// src/lib/react-email/templates/components/InfoBox.tsx

import { Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';

interface InfoBoxProps {
  children: ReactNode;
}

export const InfoBox = ({ children }: InfoBoxProps) => {
  return (
    <Section
      style={{
        backgroundColor: '#f6f9fc',
        borderRadius: '3px',
        margin: '16px 0',
        padding: '12px 16px',
      }}
    >
      {children}
    </Section>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
}

export const InfoItem = ({ label, value }: InfoItemProps) => {
  return (
    <Text
      style={{
        color: '#525f7f',
        fontSize: '14px',
        lineHeight: '22px',
        margin: '0 0 4px 0',
      }}
    >
      <strong>{label}:</strong> {value}
    </Text>
  );
};
```

### 5.4 `StatusBadge.tsx` -- Inline Status Indicator

```tsx
// src/lib/react-email/templates/components/StatusBadge.tsx

import { Text } from '@react-email/components';

interface StatusBadgeProps {
  label: string;
  color?: string;
}

export const StatusBadge = ({
  label,
  color = '#525f7f',
}: StatusBadgeProps) => {
  return (
    <Text
      style={{
        color,
        fontSize: '12px',
        fontWeight: 'bold' as const,
        margin: '0',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </Text>
  );
};
```

---

## 6. Example Template -- TestEmail

```tsx
// src/lib/react-email/templates/TestEmail.tsx

import { Text } from '@react-email/components';
import { BaseLayout } from './components/BaseLayout';
import { InfoBox, InfoItem } from './components/InfoBox';

interface TestEmailProps {
  to: string;
  subject: string;
  timestamp: string;
}

export const TestEmail = ({ to, subject, timestamp }: TestEmailProps) => {
  return (
    <BaseLayout preview="Email de prueba">
      <Text style={{ color: '#525f7f', fontSize: '16px', lineHeight: '24px' }}>
        If you are seeing this email, it means the email configuration is
        working correctly.
      </Text>

      <InfoBox>
        <InfoItem label="Date" value={timestamp} />
        <InfoItem label="Recipient" value={to} />
        <InfoItem label="Subject" value={subject} />
        <InfoItem label="Status" value="Sent successfully" />
      </InfoBox>

      <Text style={{ color: '#525f7f', fontSize: '16px', lineHeight: '24px' }}>
        The email system is ready to send notifications.
      </Text>
    </BaseLayout>
  );
};
```

---

## 7. Usage Examples

### 7.1 Send a React Email Template

```typescript
import { sendEmailViaZepto } from '@/lib/react-email';
import { TestEmail } from '@/lib/react-email/templates/TestEmail';
import React from 'react';

const result = await sendEmailViaZepto({
  to: 'user@example.com',
  subject: 'Test Email',
  react: React.createElement(TestEmail, {
    to: 'user@example.com',
    subject: 'Test Email',
    timestamp: new Date().toISOString(),
  }),
});

if (result.success) {
  console.log('Email sent!', result.data);
} else {
  console.error('Email failed:', result.error);
}
```

### 7.2 Send Raw HTML (No Template)

```typescript
import { sendRawEmailViaZepto } from '@/lib/react-email';

await sendRawEmailViaZepto({
  to: 'user@example.com',
  subject: 'Password Reset',
  html: '<p>Click <a href="https://example.com/reset">here</a> to reset your password.</p>',
  text: 'Visit https://example.com/reset to reset your password.',
});
```

### 7.3 Send to Multiple Recipients

```typescript
await sendEmailViaZepto({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Announcement',
  react: React.createElement(MyTemplate, { ... }),
});
```

### 7.4 Send with Attachments

```typescript
import fs from 'fs';

const pdfBase64 = fs.readFileSync('/path/to/file.pdf').toString('base64');

await sendEmailViaZepto({
  to: 'user@example.com',
  subject: 'Your Report',
  react: React.createElement(ReportEmail, { ... }),
  attachments: [
    {
      name: 'report.pdf',
      content: pdfBase64,
      mime_type: 'application/pdf',
    },
  ],
});
```

### 7.5 Send with .ics Calendar Invite

```typescript
const icsContent = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'DTSTART:20260315T160000Z',
  'DTEND:20260315T180000Z',
  'SUMMARY:Team Meeting',
  'LOCATION:Conference Room A',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

const icsBase64 = Buffer.from(icsContent).toString('base64');

await sendEmailViaZepto({
  to: 'user@example.com',
  subject: 'Meeting Invitation',
  react: React.createElement(MeetingEmail, { ... }),
  attachments: [
    {
      name: 'event.ics',
      content: icsBase64,
      mime_type: 'text/calendar',
    },
  ],
});
```

---

## 8. Error Handling Best Practice

Email failures should never break your main flow:

```typescript
try {
  await sendEmailViaZepto({ to, subject, react });
} catch (emailError) {
  console.error('Error sending email:', emailError);
  // Don't throw -- the main operation (enrollment, signup, etc.) still succeeds
}
```

---

## 9. Directory Structure Summary

```
src/lib/react-email/
  index.ts                          # Barrel exports
  types.ts                          # Shared types
  zeptoClient.ts                    # ZeptoMail client singleton
  render.ts                         # renderToHtml / renderToText
  sendZepto.ts                      # sendEmailViaZepto / sendRawEmailViaZepto
  templates/
    components/
      BaseLayout.tsx                # Root wrapper (logo, header, footer, Tailwind)
      ActionButton.tsx              # CTA button
      InfoBox.tsx                   # Info card with InfoItem rows
      StatusBadge.tsx               # Uppercase status label
    TestEmail.tsx                   # Starter template
    WelcomeEmail.tsx                # (create your own)
    PasswordResetEmail.tsx          # (create your own)
```

---

## 10. Template Design Tips

- **Always wrap in `BaseLayout`** -- provides `<Tailwind>`, consistent header/footer
- **Tailwind classes work** inside `BaseLayout` thanks to the `<Tailwind>` wrapper
- **Inline styles also work** -- use for maximum email client compatibility
- **Use `<table>` for side-by-side layouts** -- flexbox/grid don't work in most email clients
- **Color palette**: text `#525f7f`, headings `#32325d`, links/buttons `#556cd6`, success `#3ecf8e`, error `#e25950`, muted `#8898aa`
- **Always include plain text** -- `sendEmailViaZepto` does this automatically via `renderToText`
- **Test with** `npx react-email dev` to preview templates in browser before sending

---

## 11. ZeptoMail API Reference

| Detail | Value |
|--------|-------|
| API Endpoint | `https://api.zeptomail.com/v1.1/email` |
| Auth Header | `Zoho-enczapikey {token}` (auto-prefixed) |
| SDK Package | `zeptomail` on npm |
| SDK Import | `const { SendMailClient } = require('zeptomail')` |
| Dashboard | https://zeptomail.zoho.com/ |
| Docs | https://www.zoho.com/zeptomail/help/ |

---

## 12. Checklist

- [ ] Install `zeptomail`, `@react-email/components`, `react-email`
- [ ] Add `ZEPTOMAIL_TOKEN`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` to `.env`
- [ ] Add `zeptomail` block to your config
- [ ] Create `src/lib/react-email/` with the 5 core files
- [ ] Create `templates/components/` with shared components
- [ ] Create your first template
- [ ] Test with `sendEmailViaZepto()` or `sendRawEmailViaZepto()`
- [ ] Verify domain in ZeptoMail dashboard for production sends
