<?php
// 1. Configuration 
$destinataire = "contact@speedfix.shop"; // <-- TON EMAIL
$sujet = "🚀 Nouvelle demande SpeedFix";

// Vérification que le formulaire a bien été envoyé
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 2. Récupération et nettoyage des champs
    $nom = htmlspecialchars($_POST['nom'] ?? '');
    $prenom = htmlspecialchars($_POST['prenom'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? ''); 
    $phone = htmlspecialchars($_POST['phone'] ?? '');
    $adresse = htmlspecialchars($_POST['adresse'] ?? '');
    $modele = htmlspecialchars($_POST['modele'] ?? '');
    $probleme = nl2br(htmlspecialchars($_POST['message'] ?? ''));

    // 3. Traitement du Panier (JSON) - Design Tableau
    $panier_content = "";
    $total_panier = 0;
    $has_panier = false;
    
    if (!empty($_POST['commande_json'])) {
        $panier = json_decode($_POST['commande_json'], true);

        if (is_array($panier) && count($panier) > 0) {
            $has_panier = true;
            $panier_content .= "<table width='100%' cellpadding='0' cellspacing='0' style='margin-top:10px; border-collapse: collapse;'>";
            
            // En-têtes du tableau
            $panier_content .= "
            <tr style='background-color: #f9fafb; color: #6b7280; font-size: 12px; text-transform: uppercase;'>
                <th style='padding: 8px; text-align: left;'>Qté</th>
                <th style='padding: 8px; text-align: left;'>Produit</th>
                <th style='padding: 8px; text-align: right;'>Prix</th>
            </tr>";

            foreach ($panier as $item) {
                $sous_total = $item['price'] * $item['qty'];
                $total_panier += $sous_total;
                
                $panier_content .= "
                <tr style='border-bottom: 1px solid #e5e7eb;'>
                    <td style='padding: 10px; color:#ef4444; font-weight:bold;'>{$item['qty']}x</td>
                    <td style='padding: 10px; color:#111827;'>{$item['name']}</td>
                    <td style='padding: 10px; text-align: right; color:#374151;'>{$sous_total}€</td>
                </tr>";
            }
            $panier_content .= "</table>";
            
            // Total
            $panier_content .= "
            <div style='text-align: right; padding-top: 15px;'>
                <span style='font-size: 14px; color: #6b7280; margin-right: 10px;'>TOTAL ACCESSOIRES :</span>
                <span style='font-size: 20px; font-weight: bold; color: #ef4444;'>{$total_panier}€</span>
            </div>";
        }
    }
    
    // Si pas de panier JSON mais du texte dans accessoires (cas rare maintenant)
    if (!$has_panier && !empty($_POST['accessories'])) {
        $panier_content = "<p style='color:#555;'><em>".nl2br(htmlspecialchars($_POST['accessories']))."</em></p>";
        $has_panier = true;
    }

    // Bloc HTML du panier (s'il existe)
    $section_accessoires = "";
    if ($has_panier) {
        $section_accessoires = "
        <div style='background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;'>
            <h3 style='margin: 0 0 15px 0; color: #111827; font-size: 16px; border-left: 4px solid #ef4444; padding-left: 10px;'>
                📦 Commande d'accessoires
            </h3>
            $panier_content
        </div>";
    }


    // 4. Construction du message HTML (Design PRO)
    $message_html = "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='UTF-8'>
      <title>Nouvelle demande SpeedFix</title>
    </head>
    <body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>
      
      <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f3f4f6; padding: 20px 0;'>
        <tr>
          <td align='center'>
            
            <table width='600' cellpadding='0' cellspacing='0' style='background-color: #020617; border-radius: 8px 8px 0 0;'>
                <tr>
                    <td style='padding: 20px; text-align: center;'>
                        <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;'>
                            SPEED<span style='color: #ef4444;'>FIX</span>
                        </h1>
                    </td>
                </tr>
            </table>

            <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                <tr>
                    <td style='padding: 30px;'>
                        
                        <h2 style='color: #111827; margin-top: 0; font-size: 22px; text-align: center;'>
                            Nouvelle demande d'intervention 🛠️
                        </h2>
                        <p style='text-align: center; color: #6b7280; margin-bottom: 30px;'>
                            Reçue le " . date("d/m/Y à H:i") . "
                        </p>

                        <div style='background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;'>
                            <h3 style='margin: 0 0 15px 0; color: #111827; font-size: 16px; border-left: 4px solid #ef4444; padding-left: 10px;'>
                                👤 Informations Client
                            </h3>
                            <p style='margin: 5px 0; color: #374151;'><strong>Nom :</strong> $prenom $nom</p>
                            <p style='margin: 5px 0; color: #374151;'><strong>Tél :</strong> <a href='tel:$phone' style='color:#ef4444; text-decoration:none; font-weight:bold;'>$phone</a></p>
                            <p style='margin: 5px 0; color: #374151;'><strong>Adresse :</strong> $adresse</p>
                            " . ($email ? "<p style='margin: 5px 0; color: #374151;'><strong>Email :</strong> $email</p>" : "") . "
                        </div>

                        <div style='background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;'>
                            <h3 style='margin: 0 0 15px 0; color: #111827; font-size: 16px; border-left: 4px solid #ef4444; padding-left: 10px;'>
                                📱 Appareil & Panne
                            </h3>
                            <p style='margin: 5px 0; color: #374151; font-size: 16px;'><strong>Modèle :</strong> $modele</p>
                            <div style='margin-top: 10px; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px dashed #d1d5db; color: #4b5563;'>
                                $probleme
                            </div>
                        </div>

                        $section_accessoires

                        <p style='text-align: center; font-size: 12px; color: #9ca3af; margin-top: 30px;'>
                            Cet email a été envoyé automatiquement depuis le site speedfix.fr
                        </p>

                    </td>
                </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    ";

    // 5. En-têtes
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: SpeedFix Notif <noreply@speedfix.shop>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n"; 

    // 6. Envoi
    if (mail($destinataire, $sujet, $message_html, $headers)) {
        http_response_code(200);
        echo "Email envoyé";
    } else {
        http_response_code(500);
        echo "Erreur envoi";
    }

} else {
    http_response_code(403);
    echo "Accès interdit";
}
?>