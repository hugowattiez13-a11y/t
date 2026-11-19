"use strict";
/* ============================================================================
   LANGUES : Français · English · Español · Deutsch · Português · Italiano
   Traduction automatique de l'interface (menus, boutons, réglages, boutique,
   avatar, amis, groupes, menus en jeu, noms et genres des jeux, textes de HUD
   courants). Les messages des joueurs ne sont jamais modifiés.
   ============================================================================ */
const LANGS=[['fr','Français','🇫🇷'],['en','English','🇬🇧'],['es','Español','🇪🇸'],['de','Deutsch','🇩🇪'],['pt','Português','🇧🇷'],['it','Italiano','🇮🇹']];
const I18N_RAW=`Accueil|Home|Inicio|Start|Início|Home
Découvrir|Discover|Descubrir|Entdecken|Descobrir|Scopri
Amis|Friends|Amigos|Freunde|Amigos|Amici
Groupes|Groups|Grupos|Gruppen|Grupos|Gruppi
Créer|Create|Crear|Erstellen|Criar|Crea
Avatar|Avatar|Avatar|Avatar|Avatar|Avatar
Boutique|Shop|Tienda|Shop|Loja|Negozio
Profil|Profile|Perfil|Profil|Perfil|Profilo
Paramètres|Settings|Ajustes|Einstellungen|Configurações|Impostazioni
Jouer|Play|Jugar|Spielen|Jogar|Gioca
Annuler|Cancel|Cancelar|Abbrechen|Cancelar|Annulla
Fermer|Close|Cerrar|Schließen|Fechar|Chiudi
Rejoindre|Join|Unirse|Beitreten|Entrar|Unisciti
Quitter|Leave|Salir|Verlassen|Sair|Esci
Continuer|Continue|Continuar|Weiter|Continuar|Continua
Rejouer|Play again|Jugar otra vez|Nochmal|Jogar de novo|Rigioca
Enregistrer|Save|Guardar|Speichern|Salvar|Salva
Supprimer|Delete|Eliminar|Löschen|Excluir|Elimina
Envoyer|Send|Enviar|Senden|Enviar|Invia
Accepter|Accept|Aceptar|Annehmen|Aceitar|Accetta
Refuser|Decline|Rechazar|Ablehnen|Recusar|Rifiuta
Acheter|Buy|Comprar|Kaufen|Comprar|Compra
Porter|Wear|Ponerse|Tragen|Vestir|Indossa
Gratuit|Free|Gratis|Gratis|Grátis|Gratis
Aucun|None|Ninguno|Keins|Nenhum|Nessuno
Publier|Post|Publicar|Posten|Publicar|Pubblica
Retour|Back|Volver|Zurück|Voltar|Indietro
← Retour|← Back|← Volver|← Zurück|← Voltar|← Indietro
Ajouter|Add|Añadir|Hinzufügen|Adicionar|Aggiungi
Signaler|Report|Denunciar|Melden|Denunciar|Segnala
Effacer|Clear|Borrar|Löschen|Apagar|Cancella
Valider|Confirm|Confirmar|Bestätigen|Confirmar|Conferma
Reprendre|Resume|Reanudar|Fortsetzen|Retomar|Riprendi
Quitter le jeu|Leave game|Salir del juego|Spiel verlassen|Sair do jogo|Esci dal gioco
Joueurs|Players|Jugadores|Spieler|Jogadores|Giocatori
Joueur|Player|Jugador|Spieler|Jogador|Giocatore
Système|System|Sistema|System|Sistema|Sistema
Nouveau|New|Nuevo|Neu|Novo|Nuovo
Ajuste la qualité selon la fluidité|Adjusts quality to keep it smooth|Ajusta la calidad según la fluidez|Passt die Qualität an die Flüssigkeit an|Ajusta a qualidade conforme a fluidez|Regola la qualità in base alla fluidità
Ombres, lumière, anticrénelage, particules, résolution|Shadows, lighting, anti-aliasing, particles, resolution|Sombras, luz, antialiasing, partículas, resolución|Schatten, Licht, Kantenglättung, Partikel, Auflösung|Sombras, luz, antisserrilhado, partículas, resolução|Ombre, luci, antialiasing, particelle, risoluzione
Saute tout seul devant les obstacles|Jumps over obstacles by itself|Salta solo ante los obstáculos|Springt automatisch über Hindernisse|Pula sozinho os obstáculos|Salta da solo gli ostacoli
Touche H|H key|Tecla H|Taste H|Tecla H|Tasto H
Lumière volumétrique quand on regarde le soleil|Volumetric light when looking at the sun|Luz volumétrica al mirar al sol|Volumetrisches Licht beim Blick in die Sonne|Luz volumétrica ao olhar para o sol|Luce volumetrica guardando il sole
Image plus précise|Crisper image|Imagen más nítida|Schärferes Bild|Imagem mais nítida|Immagine più nitida
Ambiance de couleur différente pour chaque jeu|A different color mood for each game|Un ambiente de color para cada juego|Eigene Farbstimmung für jedes Spiel|Clima de cor diferente em cada jogo|Atmosfera di colore diversa per ogni gioco
Effet de lentille sur les bords|Lens effect on the edges|Efecto de lente en los bordes|Linseneffekt an den Rändern|Efeito de lente nas bordas|Effetto lente ai bordi
Interface, menus, boutique, noms des jeux|Interface, menus, shop, game names|Interfaz, menús, tienda, nombres de juegos|Oberfläche, Menüs, Shop, Spielnamen|Interface, menus, loja, nomes dos jogos|Interfaccia, menu, negozio, nomi dei giochi
marcher ·|walk ·|caminar ·|laufen ·|andar ·|cammina ·
sauter ·|jump ·|saltar ·|springen ·|pular ·|salta ·
parler ·|talk ·|hablar ·|sprechen ·|falar ·|parla ·
chat ·|chat ·|chat ·|Chat ·|chat ·|chat ·
menu ·|menu ·|menú ·|Menü ·|menu ·|menu ·
caméra|camera|cámara|Kamera|câmera|telecamera
Préparez-vous…|Get ready…|¡Prepárense!…|Macht euch bereit…|Preparem-se…|Preparatevi…
Récupérer|Claim|Reclamar|Abholen|Resgatar|Riscatta
Équipé !|Equipped!|¡Equipado!|Ausgerüstet!|Equipado!|Equipaggiato!
Mes amis|My friends|Mis amigos|Meine Freunde|Meus amigos|I miei amici
Ajouter un ami|Add a friend|Añadir amigo|Freund hinzufügen|Adicionar amigo|Aggiungi amico
Messages|Messages|Mensajes|Nachrichten|Mensagens|Messaggi
Résultats|Results|Resultados|Ergebnisse|Resultados|Risultati
Vêtements & visages|Clothes & faces|Ropa y caras|Kleidung & Gesichter|Roupas e rostos|Vestiti e volti
💰 Vendre|💰 Sell|💰 Vender|💰 Verkaufen|💰 Vender|💰 Vendi
Mettre en vente|Put on sale|Poner a la venta|Verkaufen|Colocar à venda|Metti in vendita
Aide|Help|Ayuda|Hilfe|Ajuda|Aiuto
Tout|All|Todo|Alle|Tudo|Tutto
Tous|All|Todos|Alle|Todos|Tutti
Pseudo|Username|Usuario|Name|Usuário|Nome utente
Mot de passe|Password|Contraseña|Passwort|Senha|Password
Se connecter|Log in|Entrar|Anmelden|Entrar|Accedi
Créer un compte|Sign up|Crear cuenta|Konto erstellen|Criar conta|Crea account
Créer mon compte|Create my account|Crear mi cuenta|Mein Konto erstellen|Criar minha conta|Crea il mio account
Confirmation|Confirm|Confirmación|Bestätigung|Confirmação|Conferma
Confirme le mot de passe|Confirm password|Confirma la contraseña|Passwort bestätigen|Confirme a senha|Conferma la password
Comptes enregistrés|Saved accounts|Cuentas guardadas|Gespeicherte Konten|Contas salvas|Account salvati
Déconnexion|Log out|Cerrar sesión|Abmelden|Sair|Esci
Se déconnecter|Log out|Cerrar sesión|Abmelden|Sair|Disconnettiti
Compte|Account|Cuenta|Konto|Conta|Account
Sauvegardé|Saved|Guardado|Gespeichert|Salvo|Salvato
Graphismes|Graphics|Gráficos|Grafik|Gráficos|Grafica
Son|Sound|Sonido|Ton|Som|Audio
Commandes|Controls|Controles|Steuerung|Controles|Comandi
Affichage|Display|Pantalla|Anzeige|Exibição|Schermo
Effets avancés|Advanced effects|Efectos avanzados|Erweiterte Effekte|Efeitos avançados|Effetti avanzati
Langue|Language|Idioma|Sprache|Idioma|Lingua
Qualité automatique|Auto quality|Calidad automática|Automatische Qualität|Qualidade automática|Qualità automatica
Qualité graphique|Graphics quality|Calidad gráfica|Grafikqualität|Qualidade gráfica|Qualità grafica
Volume général|Master volume|Volumen general|Gesamtlautstärke|Volume geral|Volume generale
Ambiance|Ambience|Ambiente|Atmosphäre|Ambiente|Ambiente
Musique|Music|Música|Musik|Música|Musica
Sensibilité caméra|Camera sensitivity|Sensibilidad de cámara|Kameraempfindlichkeit|Sensibilidade da câmera|Sensibilità telecamera
Inverser l'axe vertical|Invert vertical axis|Invertir eje vertical|Vertikale Achse umkehren|Inverter eixo vertical|Inverti asse verticale
Saut automatique|Auto jump|Salto automático|Automatisch springen|Pulo automático|Salto automatico
Bulles de discussion|Chat bubbles|Burbujas de chat|Chatblasen|Balões de chat|Fumetti chat
Afficher la hitbox|Show hitbox|Mostrar hitbox|Hitbox anzeigen|Mostrar hitbox|Mostra hitbox
Infos (FPS, état)|Info (FPS, state)|Info (FPS, estado)|Infos (FPS, Status)|Info (FPS, estado)|Info (FPS, stato)
Rayons de soleil|Sun rays|Rayos de sol|Sonnenstrahlen|Raios de sol|Raggi di sole
Netteté|Sharpness|Nitidez|Schärfe|Nitidez|Nitidezza
Étalonnage des couleurs|Color grading|Gradación de color|Farbkorrektur|Gradação de cor|Correzione colore
Aberration chromatique|Chromatic aberration|Aberración cromática|Chromatische Aberration|Aberração cromática|Aberrazione cromatica
Hauts|Tops|Camisetas|Oberteile|Camisas|Magliette
Bas|Bottoms|Pantalones|Hosen|Calças|Pantaloni
Visages|Faces|Caras|Gesichter|Rostos|Volti
Chapeaux|Hats|Sombreros|Hüte|Chapéus|Cappelli
Cheveux|Hair|Pelo|Haare|Cabelo|Capelli
Visage (acc.)|Face (acc.)|Cara (acc.)|Gesicht (Acc.)|Rosto (acc.)|Viso (acc.)
Dos|Back|Espalda|Rücken|Costas|Schiena
Cou|Neck|Cuello|Hals|Pescoço|Collo
Épaule|Shoulder|Hombro|Schulter|Ombro|Spalla
Emotes|Emotes|Emotes|Emotes|Emotes|Emote
Corps|Body|Cuerpo|Körper|Corpo|Corpo
Tenues|Outfits|Atuendos|Outfits|Roupas|Outfit
Teint|Skin tone|Tono de piel|Hautton|Tom de pele|Carnagione
Morphologie|Body type|Tipo de cuerpo|Körpertyp|Tipo de corpo|Corporatura
Proportions|Proportions|Proporciones|Proportionen|Proporções|Proporzioni
Classique|Classic|Clásico|Klassisch|Clássico|Classico
Fin|Slim|Delgado|Schlank|Magro|Snello
Costaud|Strong|Fuerte|Kräftig|Forte|Robusto
Mini|Mini|Mini|Mini|Mini|Mini
Grand|Tall|Alto|Groß|Alto|Alto
Cartoon|Cartoon|Caricatura|Cartoon|Desenho|Cartone
🎲 Avatar aléatoire|🎲 Random avatar|🎲 Avatar aleatorio|🎲 Zufälliger Avatar|🎲 Avatar aleatório|🎲 Avatar casuale
↺ Réinitialiser le corps|↺ Reset body|↺ Restablecer cuerpo|↺ Körper zurücksetzen|↺ Redefinir corpo|↺ Reimposta corpo
Enregistrer ma tenue|Save my outfit|Guardar mi atuendo|Outfit speichern|Salvar minha roupa|Salva il mio outfit
Glisse pour tourner|Drag to rotate|Arrastra para girar|Ziehen zum Drehen|Arraste para girar|Trascina per ruotare
Modifier mon avatar|Edit my avatar|Editar mi avatar|Avatar bearbeiten|Editar meu avatar|Modifica avatar
Rechercher…|Search…|Buscar…|Suchen…|Pesquisar…|Cerca…
🔍 Rechercher…|🔍 Search…|🔍 Buscar…|🔍 Suchen…|🔍 Pesquisar…|🔍 Cerca…
Recommandés|Recommended|Recomendados|Empfohlen|Recomendados|Consigliati
Prix croissant|Price: low to high|Precio ascendente|Preis aufsteigend|Preço crescente|Prezzo crescente
Prix décroissant|Price: high to low|Precio descendente|Preis absteigend|Preço decrescente|Prezzo decrescente
Nouveautés|New|Novedades|Neu|Novidades|Novità
Meilleures ventes|Best sellers|Más vendidos|Bestseller|Mais vendidos|Più venduti
Créations des joueurs|Player creations|Creaciones de jugadores|Spieler-Kreationen|Criações dos jogadores|Creazioni dei giocatori
✓ Possédé|✓ Owned|✓ Tienes|✓ Besitzt|✓ Possui|✓ Posseduto
Pas assez de Blox|Not enough Blox|No tienes suficientes Blox|Nicht genug Blox|Blox insuficientes|Blox insufficienti
Badges|Badges|Insignias|Abzeichen|Emblemas|Medaglie
Jeux|Games|Juegos|Spiele|Jogos|Giochi
Tout voir →|See all →|Ver todo →|Alle ansehen →|Ver tudo →|Vedi tutti →
Mes jeux|My games|Mis juegos|Meine Spiele|Meus jogos|I miei giochi
Mes groupes|My groups|Mis grupos|Meine Gruppen|Meus grupos|I miei gruppi
Créer un groupe|Create a group|Crear un grupo|Gruppe erstellen|Criar um grupo|Crea un gruppo
Mur|Wall|Muro|Pinnwand|Mural|Bacheca
Membres|Members|Miembros|Mitglieder|Membros|Membri
Demandes|Requests|Solicitudes|Anfragen|Pedidos|Richieste
Réglages|Settings|Ajustes|Einstellungen|Ajustes|Impostazioni
Propriétaire|Owner|Propietario|Besitzer|Dono|Proprietario
Membre|Member|Miembro|Mitglied|Membro|Membro
Ouvert|Open|Abierto|Offen|Aberto|Aperto
Sur demande|On request|Bajo solicitud|Auf Anfrage|Sob pedido|Su richiesta
Nom|Name|Nombre|Name|Nome|Nome
Description|Description|Descripción|Beschreibung|Descrição|Descrizione
Emblème|Emblem|Emblema|Wappen|Emblema|Stemma
Accès|Access|Acceso|Zugang|Acesso|Accesso
Exclure|Kick|Expulsar|Entfernen|Expulsar|Espelli
Principal|Main|Principal|Haupt|Principal|Principale
Message privé…|Private message…|Mensaje privado…|Private Nachricht…|Mensagem privada…|Messaggio privato…
📨 Inviter|📨 Invite|📨 Invitar|📨 Einladen|📨 Convidar|📨 Invita
Inviter|Invite|Invitar|Einladen|Convidar|Invita
Envoyer la demande|Send request|Enviar solicitud|Anfrage senden|Enviar pedido|Invia richiesta
Pseudo exact|Exact username|Usuario exacto|Genauer Name|Usuário exato|Nome esatto
Couleur|Color|Color|Farbe|Cor|Colore
Taille|Size|Tamaño|Größe|Tamanho|Dimensione
Opacité|Opacity|Opacidad|Deckkraft|Opacidade|Opacità
Devant|Front|Delante|Vorne|Frente|Davanti
Aperçu|Preview|Vista previa|Vorschau|Prévia|Anteprima
Pinceau|Brush|Pincel|Pinsel|Pincel|Pennello
Gomme|Eraser|Goma|Radierer|Borracha|Gomma
Remplir|Fill|Rellenar|Füllen|Preencher|Riempi
Ligne|Line|Línea|Linie|Linha|Linea
Rectangle|Rectangle|Rectángulo|Rechteck|Retângulo|Rettangolo
Cercle|Circle|Círculo|Kreis|Círculo|Cerchio
Texte|Text|Texto|Text|Texto|Testo
Autocollant|Sticker|Pegatina|Sticker|Adesivo|Adesivo
Pipette|Picker|Cuentagotas|Pipette|Conta-gotas|Contagocce
Dégradé|Gradient|Degradado|Verlauf|Degradê|Sfumatura
Motif|Pattern|Patrón|Muster|Padrão|Motivo
Horreur|Horror|Terror|Horror|Terror|Horror
Survie|Survival|Supervivencia|Überleben|Sobrevivência|Sopravvivenza
Combat|Combat|Combate|Kampf|Combate|Combattimento
Course|Racing|Carreras|Rennen|Corrida|Corse
Simulateur|Simulator|Simulador|Simulator|Simulador|Simulatore
Aventure|Adventure|Aventura|Abenteuer|Aventura|Avventura
Stratégie|Strategy|Estrategia|Strategie|Estratégia|Strategia
Détente|Chill|Relax|Entspannung|Relax|Relax
Sport|Sports|Deportes|Sport|Esportes|Sport
Party|Party|Fiesta|Party|Festa|Festa
Bac à sable|Sandbox|Caja de arena|Sandkasten|Caixa de areia|Sandbox
Nuit des Zombies|Zombie Night|Noche de Zombis|Zombienacht|Noite dos Zumbis|Notte degli Zombi
Manoir des Farces|Prank Mansion|Mansión de las Bromas|Streich-Villa|Mansão das Pegadinhas|Villa degli Scherzi
Camp Nounours|Teddy Camp|Campamento Osito|Teddy-Camp|Acampamento Ursinho|Campo Orsetto
Hôpital Saint-Frisson|Saint-Shiver Hospital|Hospital San Escalofrío|Krankenhaus Sankt-Schauder|Hospital São Arrepio|Ospedale San Brivido
Collège Hanté|Haunted School|Escuela Embrujada|Spukschule|Escola Assombrada|Scuola Infestata
Fête Foraine Maudite|Cursed Funfair|Feria Maldita|Verfluchter Jahrmarkt|Parque Amaldiçoado|Luna Park Maledetto
Grand Prix Turbo|Turbo Grand Prix|Gran Premio Turbo|Turbo-Grand-Prix|Grande Prêmio Turbo|Gran Premio Turbo
Tour Infernale|Infernal Tower|Torre Infernal|Höllenturm|Torre Infernal|Torre Infernale
Mine Profonde|Deep Mine|Mina Profunda|Tiefe Mine|Mina Profunda|Miniera Profonda
Défense du Royaume|Kingdom Defense|Defensa del Reino|Königreichverteidigung|Defesa do Reino|Difesa del Regno
Pêche Paradis|Fishing Paradise|Paraíso de Pesca|Angelparadies|Paraíso da Pesca|Paradiso della Pesca
Simulateur d'Animaux|Pet Simulator|Simulador de Mascotas|Tier-Simulator|Simulador de Pets|Simulatore di Animali
Bataille de Neige|Snowball Battle|Batalla de Nieve|Schneeballschlacht|Guerra de Neve|Battaglia di Neve
Pizzeria Folle|Crazy Pizzeria|Pizzería Loca|Verrückte Pizzeria|Pizzaria Maluca|Pizzeria Pazza
Évasion de Prison|Prison Escape|Fuga de Prisión|Gefängnisausbruch|Fuga da Prisão|Fuga dalla Prigione
Dernier Cube Debout|Last Cube Standing|Último Cubo en Pie|Letzter Würfel|Último Cubo de Pé|Ultimo Cubo in Piedi
Ferme Paradis|Paradise Farm|Granja Paraíso|Paradies-Farm|Fazenda Paraíso|Fattoria Paradiso
Donjon Infini|Endless Dungeon|Mazmorra Infinita|Endloser Kerker|Masmorra Infinita|Dungeon Infinito
Naufragés|Castaways|Náufragos|Schiffbrüchige|Náufragos|Naufraghi
Fuis la Marée|Flee the Flood|Huye de la Marea|Flieh vor der Flut|Fuja da Maré|Fuggi dalla Marea
Foot Cube|Cube Football|Fútbol Cubo|Würfel-Fußball|Futebol Cubo|Calcio Cubo
Cache-Cache Géant|Giant Hide & Seek|Escondite Gigante|Riesen-Versteckspiel|Esconde-Esconde Gigante|Nascondino Gigante
Usine à Blocs Tycoon|Block Factory Tycoon|Fábrica de Bloques Tycoon|Blockfabrik-Tycoon|Fábrica de Blocos Tycoon|Fabbrica di Blocchi Tycoon
Royaume des Slimes|Slime Kingdom|Reino de los Slimes|Schleimkönigreich|Reino dos Slimes|Regno degli Slime
Obby Arc-en-ciel|Rainbow Obby|Obby Arcoíris|Regenbogen-Obby|Obby Arco-íris|Obby Arcobaleno
Chat vocal|Voice chat|Chat de voz|Sprachchat|Chat de voz|Chat vocale
Récompense du jour|Daily reward|Recompensa diaria|Tagesbelohnung|Recompensa diária|Ricompensa giornaliera
🎁 Récompense du jour|🎁 Daily reward|🎁 Recompensa diaria|🎁 Tagesbelohnung|🎁 Recompensa diária|🎁 Ricompensa giornaliera
Dans ce serveur|On this server|En este servidor|Auf diesem Server|Neste servidor|In questo server
Hors ligne|Offline|Desconectado|Offline|Offline|Offline
En ligne|Online|En línea|Online|Online|Online
Serveurs|Servers|Servidores|Server|Servidores|Server
Serveur privé|Private server|Servidor privado|Privater Server|Servidor privado|Server privato
Réactions|Reactions|Reacciones|Reaktionen|Reações|Reazioni
Passes de jeu|Game passes|Pases de juego|Spielpässe|Passes de jogo|Pass di gioco
Nouveau jeu|New game|Nuevo juego|Neues Spiel|Novo jogo|Nuovo gioco
Que veux-tu créer ?|What do you want to create?|¿Qué quieres crear?|Was möchtest du erstellen?|O que você quer criar?|Cosa vuoi creare?
T-shirt / haut|T-shirt / top|Camiseta|T-Shirt / Oberteil|Camiseta|Maglietta
Pantalon / bas|Pants|Pantalón|Hose|Calça|Pantaloni
Visage|Face|Cara|Gesicht|Rosto|Viso
Se cacher|Hide|Esconderse|Verstecken|Esconder-se|Nasconditi
Vendre|Sell|Vender|Verkaufen|Vender|Vendi
Magasin|Store|Tienda|Laden|Loja|Negozio
Pêcher|Fish|Pescar|Angeln|Pescar|Pesca
Ouvrir|Open|Abrir|Öffnen|Abrir|Apri
Parler|Talk|Hablar|Sprechen|Falar|Parla
Tour suivant|Next turn|Siguiente turno|Nächste Runde|Próxima vez|Turno successivo
Manche suivante|Next round|Siguiente ronda|Nächste Runde|Próxima rodada|Round successivo
Nouvelle partie|New match|Nueva partida|Neues Spiel|Nova partida|Nuova partita
Victoire !|Victory!|¡Victoria!|Sieg!|Vitória!|Vittoria!
Défaite…|Defeat…|Derrota…|Niederlage…|Derrota…|Sconfitta…
Pour discuter, clique ici ou appuie sur « / »|To chat, click here or press "/"|Para chatear, haz clic aquí o pulsa «/»|Zum Chatten hier klicken oder „/" drücken|Para conversar, clique aqui ou aperte "/"|Per chattare clicca qui o premi «/»`;
const I18N=new Map(),LK=['fr','en','es','de','pt','it'];
for(const line of I18N_RAW.split('\n')){const p=line.split('|');if(p.length>=6)I18N.set(p[0],p)}
const I18N_RX=[[/^Vague (\d+)( \/ \d+)?/,['Wave','Oleada','Welle','Onda','Ondata']],[/^Étape (\d+)/,['Stage','Etapa','Etappe','Etapa','Fase']],[/^Jour (\d+)/,['Day','Día','Tag','Dia','Giorno']],[/^Étage (\d+)/,['Floor','Piso','Etage','Andar','Piano']],[/^Chapitre (\d+)/,['Chapter','Capítulo','Kapitel','Capítulo','Capitolo']],[/^Tour (\d+)/,['Lap','Vuelta','Runde','Volta','Giro']]];
const I18N_TPL=[[/^Salut, (.+) !$/,['Hi, $1!','¡Hola, $1!','Hallo, $1!','Oi, $1!','Ciao, $1!']],[/^Bienvenue dans (.+) !(.*)$/,['Welcome to $1!$2','¡Bienvenido a $1!$2','Willkommen in $1!$2','Bem-vindo a $1!$2','Benvenuto in $1!$2']],[/^Série : (\d+) jour\(s\)$/,['Streak: $1 day(s)','Racha: $1 día(s)','Serie: $1 Tag(e)','Sequência: $1 dia(s)','Serie: $1 giorno/i']],[/^Prochaine vague dans (\d+) s$/,['Next wave in $1 s','Próxima oleada en $1 s','Nächste Welle in $1 s','Próxima onda em $1 s','Prossima ondata tra $1 s']],[/^(\d+) zombies restants$/,['$1 zombies left','Quedan $1 zombis','Noch $1 Zombies','$1 zumbis restantes','$1 zombi rimasti']]];
let LANG='fr';
function tr(s){if(LANG==='fr'||!s)return s;const i=LK.indexOf(LANG);const m=/^([^\p{L}]*)(.*?)([^\p{L}]*)$/u.exec(s);if(!m)return s;const core=m[2].trim();const e=I18N.get(core)||I18N.get(s.trim());
  if(e)return e===I18N.get(s.trim())?e[i]:m[1]+e[i]+m[3];for(const[rx,w]of I18N_TPL){if(rx.test(s.trim()))return s.trim().replace(rx,w[i-1])}
  for(const[rx,w]of I18N_RX){const r=rx.exec(core);if(r)return m[1]+core.replace(rx.source.match(/\^(\S+)/)[1].replace('\\',''),w[i-1])+m[3]}return s}
const I18N_SKIP=new Set(['chatlog','bubbles','plist','dmLog']);
function trNode(n){if(n.nodeType===3){const p=n.parentElement;if(!p||p.closest('#chatlog,#bubbles,.dmm,.gpost p,input,textarea,script,style,code'))return;const o=n.__fr??n.nodeValue;const t=tr(o);if(t!==n.nodeValue){n.__fr=o;n.nodeValue=t}else if(LANG==='fr'&&n.__fr!=null&&n.nodeValue!==n.__fr){n.nodeValue=n.__fr}return}
  if(n.nodeType!==1)return;for(const a of['placeholder','title','aria-label']){if(!n.hasAttribute(a))continue;const k='__fr_'+a,o=n[k]??n.getAttribute(a),t=tr(o);if(t!==n.getAttribute(a)){n[k]=o;n.setAttribute(a,t)}}
  const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let x;while((x=w.nextNode())){if(x.nodeType===3)trNode(x);else for(const a of['placeholder','title']){if(!x.hasAttribute||!x.hasAttribute(a))continue;const k='__fr_'+a,o=x[k]??x.getAttribute(a),t=tr(o);if(t!==x.getAttribute(a)){x[k]=o;x.setAttribute(a,t)}}}}
const I18N_OBS=new MutationObserver(ms=>{if(LANG==='fr')return;for(const m of ms){if(m.type==='characterData')trNode(m.target);else for(const n of m.addedNodes)trNode(n)}});
function setLang(l){LANG=LK.includes(l)?l:'fr';document.documentElement.lang=LANG;if(typeof SET!=='undefined')SET.lang=LANG;try{localStorage.setItem('cubik_lang',LANG)}catch(e){}trNode(document.body)}
function langPanel(B,onChange){const s=el('select',{class:'langsel'});for(const[k,n,f]of LANGS)s.append(el('option',{value:k,text:f+' '+n}));s.value=LANG;s.onchange=()=>{setLang(s.value);if(typeof saveSettings==='function')saveSettings();SFX.click();onChange&&onChange()};
  B.append(el('h3',{text:'Langue'}),el('div',{class:'set'},el('div',{},'🌍 Langue / Language',el('small',{text:'Interface, menus, boutique, noms des jeux'})),s))}
(()=>{let l='fr';try{l=localStorage.getItem('cubik_lang')||(navigator.language||'fr').slice(0,2)}catch(e){}LANG=LK.includes(l)?l:'fr';
  const start=()=>{I18N_OBS.observe(document.body,{childList:true,subtree:true,characterData:true});if(LANG!=='fr')trNode(document.body)};if(document.body)start();else addEventListener('DOMContentLoaded',start);
  const ap0=typeof applySettings==='function'?applySettings:null;if(ap0)applySettings=function(){ap0();if(SET.lang&&SET.lang!==LANG)setLang(SET.lang)};
  const st=document.createElement('style');st.textContent='.langsel{padding:8px 12px;border-radius:12px;background:#0003;color:inherit;border:1px solid var(--bd);font-weight:700}';document.head.appendChild(st)})();
