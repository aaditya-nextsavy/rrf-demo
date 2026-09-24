<?php

header('Content-Type: application/json; charset=UTF-8');

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/../src/Exception.php';
require __DIR__ . '/../src/PHPMailer.php';
require __DIR__ . '/../src/SMTP.php';

// Per-environment settings (SMTP login, reCAPTCHA secret, site URL) live one level above the site folder,
// so they never ship with the code: public_html's parent on cPanel, C:\xampp\htdocs\RRV locally.
// See PHPMailer/rrf-config.example.php for the expected keys.
const CONFIG_PATH = __DIR__ . '/../../../rrf-config.php';

if (!is_file(CONFIG_PATH)) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'The contact form is not configured yet.',
    ]);
    exit;
}

$config = require CONFIG_PATH;

// Details shown in the acknowledgement email sent to the visitor.
define('SITE_URL', $config['site_url']);
const CONTACT_EMAIL = 'info@raajratnafoundation.com';
const CONTACT_PHONE = '+917927561915';
const LOGO_PATH = __DIR__ . '/../../assets/media/icons/rrf-logo.png';
const SOCIAL_LINKS = [
    ['https://www.facebook.com/', 'https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png', 'Facebook'],
    ['https://www.x.com/', 'https://img.icons8.com/ios-filled/50/ffffff/twitterx--v1.png', 'X'],
    ['https://www.linkedin.com/company/raajratna-foundation/', 'https://img.icons8.com/ios-filled/50/ffffff/linkedin.png', 'LinkedIn'],
    ['https://www.instagram.com/', 'https://img.icons8.com/ios-filled/50/ffffff/instagram-new--v1.png', 'Instagram'],
];

const CATEGORY_LABELS = [
    'option-1' => 'Ask a question or get more information.',
    'option-2' => 'Share feedback, or report an issue.',
    'option-3' => 'Discuss a future business opportunity.',
    'option-4' => 'Others.',
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => false,
        'message' => 'Invalid request method.',
    ]);
    exit;
}

$firstName = trim($_POST['first_name'] ?? '');
$lastName = trim($_POST['last_name'] ?? '');
$mobileNumber = trim($_POST['mobile_number'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$category = trim($_POST['category'] ?? '');
$categoryLabel = CATEGORY_LABELS[$category] ?? '';
$fullName = trim($firstName . ' ' . $lastName);

if ($firstName === '' || $lastName === '' || $mobileNumber === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => 'All fields are required.',
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => 'Please provide a valid email address.',
    ]);
    exit;
}

// Verify the captcha with Google so the form cannot be bypassed by posting here directly.
// Skipped only while no secret is configured (local development).
if ($config['recaptcha_secret'] !== '') {
    $verify = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($verify, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $config['recaptcha_secret'],
            'response' => $_POST['g-recaptcha-response'] ?? '',
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $captchaResult = json_decode((string) curl_exec($verify), true);

    if (empty($captchaResult['success'])) {
        http_response_code(400);
        echo json_encode([
            'status' => false,
            'message' => 'Captcha verification failed. Please try again.',
        ]);
        exit;
    }
}

$safeFullName = htmlspecialchars($fullName, ENT_QUOTES, 'UTF-8');
$safeMobileNumber = htmlspecialchars($mobileNumber, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeCategory = htmlspecialchars($categoryLabel !== '' ? $categoryLabel : '—', ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$submittedAt = date('d M Y, h:i A');

function createMailer(array $config): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->Port = $config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['mail_from'], $config['mail_from_name']);
    $mail->isHTML(true);

    return $mail;
}

// Full-width email shell: table-based so it renders consistently across mail clients.
function emailLayout(string $title, string $content): string
{
    return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{$title}</title>
</head>
<body style='margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%; background-color:#f4f6f8;'>
        <tr>
            <td style='padding:16px;'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%; background-color:#ffffff; border:1px solid #dddddd; border-radius:6px; border-collapse:separate; overflow:hidden;'>
                    <tr>
                        <td style='background-color:#017CC1; border-bottom:4px solid #EF4023; padding:20px 24px; color:#ffffff; font-size:20px; font-weight:bold;'>
                            {$title}
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:24px;'>
                            {$content}
                        </td>
                    </tr>
                    <tr>
                        <td style='background-color:#fafafa; border-top:1px solid #dddddd; padding:14px 24px; font-size:12px; color:#777777;'>
                            Raajratna Foundation
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
}

function detailRow(string $label, string $value): string
{
    return "
        <tr>
            <th style='width:28%; text-align:left; vertical-align:top; padding:10px 12px; border:1px solid #dddddd; background-color:#f4f4f4; font-weight:bold;'>{$label}</th>
            <td style='text-align:left; vertical-align:top; padding:10px 12px; border:1px solid #dddddd;'>{$value}</td>
        </tr>";
}

$adminBody = emailLayout('Contact Form Details', "
    <p style='margin:0 0 16px;'>A new enquiry was submitted on the website on {$submittedAt}.</p>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%; border-collapse:collapse; font-size:14px;'>"
        . detailRow('Full Name', $safeFullName)
        . detailRow('Email', "<a href='mailto:{$safeEmail}' style='color:#017CC1;'>{$safeEmail}</a>")
        . detailRow('Contact Number', $safeMobileNumber)
        . detailRow('Purpose of Contact', $safeCategory)
        . detailRow('Message', $safeMessage) . "
    </table>
    <p style='margin:16px 0 0; font-size:12px; color:#777777;'>Reply to this email to respond directly to {$safeFullName}.</p>
");

// Acknowledgement email sent to the visitor: plain white letter layout with logo, CTA links and social footer.
function userEmailLayout(string $safeFullName): string
{
    $site = SITE_URL;
    $contactEmail = CONTACT_EMAIL;
    $contactPhone = CONTACT_PHONE;
    $year = date('Y');
    $text = 'margin:0 0 18px; font-size:16px; line-height:1.6; font-weight:500; color:#0B3A66;';
    $cta = 'display:inline-block; padding:0 0 4px; border-bottom:1.5px solid #0B3A66; color:#0B3A66; font-size:15px; font-weight:bold; text-decoration:none; text-transform:uppercase; letter-spacing:0.2px;';
    $small = 'font-size:14px; line-height:1.6; font-weight:500; color:#0B3A66;';
    $footerLink = 'color:#0B3A66; text-decoration:none;';

    $socialIcons = '';
    foreach (SOCIAL_LINKS as [$url, $icon, $label]) {
        $socialIcons .= "
            <td style='padding:0 10px 0 0;'>
                <table role='presentation' cellspacing='0' cellpadding='0' border='0'>
                    <tr>
                        <td width='38' height='38' align='center' valign='middle' style='width:38px; height:38px; background-color:#0B3A66; border-radius:5px; font-size:0; line-height:0; mso-line-height-rule:exactly;'>
                            <a href='{$url}' target='_blank' style='display:block; width:20px; height:20px; margin:0 auto; font-size:0; line-height:0; text-decoration:none;'><img src='{$icon}' width='20' height='20' alt='{$label}' style='display:block; width:20px; height:20px; border:0;'></a>
                        </td>
                    </tr>
                </table>
            </td>";
    }

    return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Thank You for Contacting Raajratna Foundation</title>
</head>
<body style='margin:0; padding:0; background-color:#ffffff; font-family:&quot;Segoe UI&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%; background-color:#ffffff;'>
        <tr>
            <td style='padding:32px 20px;'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='width:100%; max-width:600px;'>
                    <tr>
                        <td style='padding:0 0 32px;'>
                            <img src='cid:rrf-logo' width='190' alt='Raajratna Foundation' style='display:block; width:190px; height:auto; border:0;'>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style='{$text}'>Dear {$safeFullName},</p>
                            <p style='{$text}'>Thank you for contacting Raajratna Foundation.</p>
                            <p style='{$text}'>Every conversation helps us serve our communities better. Through our work in healthcare, education, skill development and social welfare, we strive to create lasting change for people who need it most.</p>
                            <p style='{$text}'>We have received your message. Our team is reviewing the details you shared and will get back to you as soon as possible.</p>
                            <p style='{$text}'>If you need any assistance in the meantime, feel free to reach out to our team.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:4px 0 28px;'>
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0'>
                                <tr>
                                    <td style='padding:0 24px 0 0;'><a href='{$site}' target='_blank' style='{$cta}'>Visit our website &nbsp;&rsaquo;</a></td>
                                    <td><a href='tel:{$contactPhone}' style='{$cta}'>Call our team &nbsp;&rsaquo;</a></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style='margin:0 0 18px; font-size:16px; line-height:1.6; font-weight:500; color:#0B3A66;'>Best regards,</p>
                            <p style='margin:0 0 40px; font-size:17px; line-height:1.6; color:#0B3A66; font-weight:bold;'>Team Raajratna Foundation</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style='margin:0 0 10px; {$small}'>For any queries, connect with us at <a href='mailto:{$contactEmail}' style='color:#0B3A66; font-weight:bold; text-decoration:none;'>{$contactEmail}</a></p>
                            <p style='margin:0 0 24px; {$small}'>&copy; {$year} Raajratna Foundation. All Rights Reserved.</p>
                            <p style='margin:0 0 24px; {$small}'>
                                <a href='{$site}contact.html' target='_blank' style='{$footerLink}'>Contact</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href='{$site}about.html' target='_blank' style='{$footerLink}'>About</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href='{$site}terms-and-conditions.html' target='_blank' style='{$footerLink}'>Terms of use</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href='{$site}privacy-policy.html' target='_blank' style='{$footerLink}'>Privacy policy</a>
                            </p>
                            <p style='margin:0 0 12px; {$small}'>Follow us on</p>
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0'>
                                <tr>{$socialIcons}
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
}

$userBody = userEmailLayout($safeFullName);

try {
    $mail = createMailer($config);
    $mail->addAddress($config['admin_email']);
    $mail->addReplyTo($email, $fullName);
    $mail->Subject = "New Contact Form Submission - {$fullName}";
    $mail->Body = $adminBody;
    $mail->AltBody = "Contact Form Details\n\nFull Name: {$fullName}\nEmail: {$email}\nContact Number: {$mobileNumber}\nPurpose of Contact: {$categoryLabel}\n\nMessage:\n{$message}";
    $mail->send();

    $userMail = createMailer($config);
    $userMail->addAddress($email, $fullName);
    $userMail->addReplyTo($config['admin_email'], $config['mail_from_name']);
    $userMail->Subject = 'Thank You for Contacting Raajratna Foundation';
    $userMail->addEmbeddedImage(LOGO_PATH, 'rrf-logo', 'rrf-logo.png');
    $userMail->Body = $userBody;
    $userMail->AltBody = "Dear {$fullName},\n\nThank you for contacting Raajratna Foundation.\n\nWe have received your message. Our team is reviewing the details you shared and will get back to you as soon as possible.\n\nIf you need any assistance in the meantime, feel free to reach out to our team at " . CONTACT_EMAIL . " or " . CONTACT_PHONE . ".\n\nBest regards,\nTeam Raajratna Foundation\n\n" . SITE_URL;
    $userMail->send();

    echo json_encode([
        'status' => true,
        'message' => 'Your message has been sent successfully.',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'We could not send your message right now. Please try again later.',
    ]);
}
