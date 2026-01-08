<?php

include 'config/db.php';
if($_POST){
    $user = $users->findOne(["email" => $_POST['email']]);

    if($user && password_verify($_POST['password'], $user['password'])){
        $_SESSION['user_id'] = (string)$user['_id'];
        $_SESSION['name'] = $user['name'];
        header("Location: dashboard.php");
    }
    else{
        echo "invalid login";
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

        <form method="post">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button>Login</button>
        </form>

    </body>
</html>