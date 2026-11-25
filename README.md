# The Sydney Decathlon


## Mission Board button
Open the gear/settings button in the website and enter the full URL for your Mission Board (including `https://`). It is saved on that device.

## Game behaviour
- Drawing a curse activates it immediately. Timed curses start a countdown based on a duration stated on the card; when the timer expires the curse moves to the discard pile.
- Curses without a clear timer stay pinned in Active Curses until you press **CLEAR** (for example, after completing the relevant mission).
- Blessings and Curse Reverse are kept in your hand until used. Using a blessing moves it to the discard pile.
- Hand limit starts at 3. **Expanded Hand (+2 Slots)** raises it to 5 when used.
- If the hand is full when a blessing is drawn, choose a card in your hand to discard or discard the new card.
- Deck, hand, active curses, discard pile, settings and timer end-times are saved in local storage.

Some complex card effects (such as multi-draw selection, deck stacking, transport conditions and split-team tracking) are presented on the card itself and may require the players to carry them out manually. Active curse tracking, basic timers, hand management and discard handling are automated.

## Files
- `index.html`, `style.css`, `app.js`: app
- `cards.js`: card titles/descriptions/types and image paths
- `cards/`: supplied card artwork
- `card-back.png`: custom blue-purple Sydney Decathlon card back
- `manifest.webmanifest`, `sw.js`: PWA setup
