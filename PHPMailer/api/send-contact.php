<?php

header('Content-Type: application/json; charset=UTF-8');

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/../src/Exception.php';
require __DIR__ . '/../src/PHPMailer.php';
require __DIR__ . '/../src/SMTP.php';

// All mail is sent from, and enquiries are delivered to, this mailbox.
const MAIL_ADDRESS = 'aaditya@nextsavy.com';
const MAIL_APP_PASSWORD = 'YOUR_GMAIL_APP_PASSWORD'; // Google Account > Security > App passwords
const MAIL_FROM_NAME = 'Raajratna Foundation';

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

$safeFullName = htmlspecialchars($fullName, ENT_QUOTES, 'UTF-8');
$safeFirstName = htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8');
$safeMobileNumber = htmlspecialchars($mobileNumber, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeCategory = htmlspecialchars($categoryLabel !== '' ? $categoryLabel : '—', ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$submittedAt = date('d M Y, h:i A');

function createMailer(): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'aaditya@nextsavy.com';
    $mail->Password = 'xebiheyezbrkgrbr';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom('aaditya@nextsavy.com', 'RRV Foundation');
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

$userBody = emailLayout('Thank You for Contacting Us', "
    <p style='margin:0 0 14px;'>Dear {$safeFirstName},</p>
    <p style='margin:0 0 14px; line-height:1.6;'>Thank you for reaching out to us. We have received your message and it means a lot that you took the time to connect with us. Our team is carefully reviewing the details you shared and will get back to you with a response as soon as possible.</p>
    <p style='margin:0 0 14px; line-height:1.6;'>In the meantime, if you have any additional information or questions, please feel free to reply to this email. We're always happy to assist.</p>
    <p style='margin:0; line-height:1.6;'>Best regards,<br>Raajratna Foundation</p>
");

try {
    $mail = createMailer();
    $mail->addAddress(MAIL_ADDRESS);
    $mail->addReplyTo($email, $fullName);
    $mail->Subject = "New Contact Form Submission - {$fullName}";
    $mail->Body = $adminBody;
    $mail->AltBody = "Contact Form Details\n\nFull Name: {$fullName}\nEmail: {$email}\nContact Number: {$mobileNumber}\nPurpose of Contact: {$categoryLabel}\n\nMessage:\n{$message}";
    $mail->send();

    $userMail = createMailer();
    $userMail->addAddress($email, $fullName);
    $userMail->addReplyTo(MAIL_ADDRESS, MAIL_FROM_NAME);
    $userMail->Subject = 'Thank You for Contacting Us';
    $userMail->Body = $userBody;
    $userMail->AltBody = "Dear {$firstName},\n\nThank you for reaching out to us. We have received your message and our team will get back to you as soon as possible.\n\nIf you have any additional information or questions, please feel free to reply to this email.\n\nBest regards,\nRaajratna Foundation";
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
