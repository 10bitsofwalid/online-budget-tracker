<?php
include 'config/db.php';

if ($_POST) {
    $users->insertOne([
        "name" => $_POST['name'],
        "email" => $_POST['email'],
        "password" => password_hash($_POST['password'], PASSWORD_DEFAULT)
    ]);
    header("Location: login.php");
}
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Register</title>
        <link rel="stylesheet" href="assets/css/style.css">
    </head>
    <body>
        <h2>Register</h2>

        <form method="post">
            <input type="text" name="name" placeholder="Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button>Register</button>
        </form>

    </body>
</html>