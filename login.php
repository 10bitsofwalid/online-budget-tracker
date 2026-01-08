<?php

include 'config/db.php';
if(isset($_SESSION['user_id'])) header("Location: dashboard.php");

$error = '';
if($_POST){
    $users = getUsers();
    $user = null;
    foreach ($users as $u) {
        if ($u['email'] === $_POST['email']) {
            $user = $u;
            break;
        }
    }

    if($user && password_verify($_POST['password'], $user['password'])){
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['name'] = $user['name'];
        header("Location: dashboard.php");
    }
    else{
        $error = "Invalid login credentials.";
    }
}

?>


<!DOCTYPE html>
<html>
    <head>
        <title>Login</title>
        <link rel="stylesheet" href="assets/css/style.css">
    </head>
    <body>
        <h2>Login</h2>

        <?php if($error): ?>
            <div class="alert"><?=$error?></div>
        <?php endif; ?>

        <form method="post">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button>Login</button>
        </form>

    </body>
    <script src="assets/js/script.js"></script>
</html>