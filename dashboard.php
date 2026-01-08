<?php 

include 'config/db.php';
if(!isset($_SESSION['user_id'])) header("Location: login.php");

$expenses = getExpenses();
$data = array_filter($expenses, function($e) {
    return $e['user_id'] == $_SESSION['user_id'];
});
$total = 0;

?>


<!DOCTYPE html>
<html>
    <head>
        <title>Dashboard</title>
        <link rel="stylesheet" href="assets/css/style.css">
    </head>
    <body>
        <h2>Welcome, <?=$_SESSION['name']?></h2>

        <a href="logout.php" class="logout-link">Logout</a>
        <h3>Add expense</h3>
        <form method="post" action="add_expense.php">
            <input type="text" name="title" placeholder="Expense title" required>
            <input type="number" name="amount" placeholder="Amount" required>
            <select name="category">
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Others</option>
            </select>
            <button>Add</button>
        </form>

        <h3>Expense list</h3>
        <table>
            <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
            </tr>

            <?php foreach ($data as $e):
            $total += $e['amount'];
            ?>

            <tr>
                <td><?=$e['title']?></td>
                <td><?=$e['amount']?></td>
                <td><?=$e['category'] ?></td>
            </tr>

            <?php endforeach; ?>

        </table>

        <h3>Total expense: <?=$total?> tk</h3>

    </body>
    <script src="assets/js/script.js"></script>
</html>