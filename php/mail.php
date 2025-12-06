<?php
// 1. Configuration 
$destinataire = "contact@speedfix.shop"; // <-- TON EMAIL
$sujet = "Nouvelle demande SpeedFix";

// Vérification que le formulaire a bien été envoyé
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 2. Récupération et nettoyage des champs classiques
    $nom = htmlspecialchars($_POST['nom'] ?? '');
    $prenom = htmlspecialchars($_POST['prenom'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? ''); // Si tu ajoutes un champ email plus tard
    $phone = htmlspecialchars($_POST['phone'] ?? '');
    $adresse = htmlspecialchars($_POST['adresse'] ?? '');
    $modele = htmlspecialchars($_POST['modele'] ?? '');
    $probleme = nl2br(htmlspecialchars($_POST['message'] ?? ''));
    
    // Le champ accessoires (qui peut contenir du texte si le panier est vide)
    $accessoires_texte = htmlspecialchars($_POST['accessories'] ?? '');

    // 3. Traitement du Panier (JSON)
    $panier_html = "";
    $total_panier = 0;
    
    if (!empty($_POST['commande_json'])) {
        // On décode le texte JSON reçu pour en faire un tableau PHP
        $panier = json_decode($_POST['commande_json'], true);

        if (is_array($panier) && count($panier) > 0) {
            $panier_html .= "<h3>🛍️ Commande d'accessoires :</h3><ul>";
            foreach ($panier as $item) {
                $sous_total = $item['price'] * $item['qty'];
                $total_panier += $sous_total;
                $panier_html .= "<li><strong>{$item['qty']}x</strong> {$item['name']} - {$sous_total}€</li>";
            }
            $panier_html .= "</ul><p><strong>Total Accessoires : {$total_panier}€</strong></p><hr>";
        }
    }

    // 4. Construction du message HTML (Design du mail)
    $message_html = "
    <html>
    <head>
      <title>Nouvelle demande Reparation</title>
    </head>
    <body style='font-family:Arial, sans-serif; color:#333;'>
      <h2 style='color:#ef4444;'>Nouvelle demande de réparation</h2>
      <p><strong>Client :</strong> $prenom $nom</p>
      <p><strong>Téléphone :</strong> <a href='tel:$phone'>$phone</a></p>
      <p><strong>Adresse :</strong> $adresse</p>
      <hr>
      <h3>📱 Appareil</h3>
      <p><strong>Modèle :</strong> $modele</p>
      <p><strong>Problème déclaré :</strong><br>$probleme</p>
      <hr>
      $panier_html
      <p><em>Marzouk GHOSTKILLER93</p>
    </body>
    </html>
    ";

    // 5. En-têtes pour envoyer un mail HTML propre
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Site SpeedFix <noreply@speedfix.fr>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n"; // Si tu récupères l'email client

    // 6. Envoi final
    if (mail($destinataire, $sujet, $message_html, $headers)) {
        http_response_code(200); // Succès
        echo "Email envoyé";
    } else {
        http_response_code(500); // Erreur serveur
        echo "Erreur lors de l'envoi";
    }

} else {
    http_response_code(403); // Interdit
    echo "Accès interdit";
}
