<?php
include 'config/db.php';

$error = '';
if ($_POST) {
    $users = getUsers();
    $emailExists = false;
    foreach ($users as $u) {
        if ($u['email'] === $_POST['email']) {
            $emailExists = true;
            break;
        }
    }
    if ($emailExists) {
        $error = "Email already registered.";
    } else {
        $newUser = [
            'id' => count($users) + 1,
            'name' => $_POST['name'],
            'email' => $_POST['email'],
            'password' => password_hash($_POST['password'], PASSWORD_DEFAULT)
        ];
        $users[] = $newUser;
        saveUsers($users);
        header("Location: login.php");
    }
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

    <?php if ($error): ?>
        <div class="alert"><?= $error ?></div>
    <?php endif; ?>

    <form method="post">
        <input type="text" name="name" placeholder="Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <button>Register</button>
    </form>

</body>
<script src="assets/js/script.js"></script>

</html>