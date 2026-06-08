<?php

header('Content-Type: application/json; charset=UTF-8');

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/../src/Exception.php';
require __DIR__ . '/../src/PHPMailer.php';
require __DIR__ . '/../src/SMTP.php';

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

$safeFirstName = htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8');
$safeLastName = htmlspecialchars($lastName, ENT_QUOTES, 'UTF-8');
$safeMobileNumber = htmlspecialchars($mobileNumber, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'harsh@nextsavy.com';
    $mail->Password = 'srispqmnvszmfvvy';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom('harsh@nextsavy.com', 'RRV Foundation');
    $mail->addAddress('harsh@nextsavy.com');
    $mail->addReplyTo($email, trim($firstName . ' ' . $lastName));
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Inquiry';
    $mail->Body = "
        <h2>New Contact Inquiry</h2>
        <p><strong>First Name:</strong> {$safeFirstName}</p>
        <p><strong>Last Name:</strong> {$safeLastName}</p>
        <p><strong>Mobile Number:</strong> {$safeMobileNumber}</p>
        <p><strong>Email:</strong> {$safeEmail}</p>
        <p><strong>Message:</strong><br>{$safeMessage}</p>
    ";
    $mail->AltBody = "New Contact Inquiry\n\nFirst Name: {$firstName}\nLast Name: {$lastName}\nMobile Number: {$mobileNumber}\nEmail: {$email}\n\nMessage:\n{$message}";
    $mail->send();

    $userMail = new PHPMailer(true);
    $userMail->isSMTP();
    $userMail->Host = 'smtp.gmail.com';
    $userMail->SMTPAuth = true;
    $userMail->Username = 'harsh@nextsavy.com';
    $userMail->Password = 'srispqmnvszmfvvy';
    $userMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $userMail->Port = 587;
    $userMail->CharSet = 'UTF-8';

    $userMail->setFrom('harsh@nextsavy.com', 'RRV Foundation');
    $userMail->addAddress($email, trim($firstName . ' ' . $lastName));
    $userMail->isHTML(true);
    $userMail->Subject = 'Thank You For Contacting Us';
    $userMail->Body = "
        <h2>Thank You {$safeFirstName}</h2>
        <p>We have received your inquiry successfully.</p>
        <p>Our team will contact you soon.</p>
    ";
    $userMail->AltBody = "Thank you {$firstName}\n\nWe have received your inquiry successfully.\nOur team will contact you soon.";
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
