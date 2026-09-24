<?php

// Copy this file to rrf-config.php ONE LEVEL ABOVE the site folder and fill in real values:
//   cPanel: /home/<cpanel-user>/rrf-config.php   (next to public_html, not inside it)
//   XAMPP:  C:\xampp\htdocs\RRV\rrf-config.php
// Never commit the real file.

return [
    // Outgoing mail server. Gmail: smtp.gmail.com / Microsoft 365: smtp.office365.com
    'smtp_host' => 'smtp.example.com',
    'smtp_port' => 587,
    'smtp_secure' => 'tls', // 'tls' for port 587, 'ssl' for port 465
    'smtp_username' => 'sender@example.com',
    'smtp_password' => 'CHANGE_ME',

    // Sender shown to recipients. Microsoft 365 requires this to be the same mailbox as smtp_username.
    'mail_from' => 'sender@example.com',
    'mail_from_name' => 'Raajratna Foundation',

    // Mailbox that receives the enquiries.
    'admin_email' => 'enquiries@example.com',

    // Secret key paired with RECAPTCHA_SITE_KEY in assets/scripts/components/contactForm.js.
    // Leave empty to skip server-side verification (local development only).
    'recaptcha_secret' => '',

    // Used for links in the visitor's thank-you email. Keep the trailing slash.
    'site_url' => 'https://raajratnafoundation.com/',
];
