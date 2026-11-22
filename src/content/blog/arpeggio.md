---
title: Arpeggio
date: 2026-11-21
---

There are more possible chess games than atoms in the universe. Probably. I think I read that somewhere.

I certainly believe it; A 2 week incursion into chess programming left me with a healthy fear of exponential runtimes that leetcode never quite managed to instill.

Disclaimer: This article is intended to be fairly accessible to individuals of all levels of technical ability. If you, like myself and so many others, were taught chess by a relative in your childhood, that's likely sufficient to grasp the majority of this article.
### The Basics

This project was actually started around a year ago (Dec 2025), with my sights set far lower. I initially wanted to push my C++ skills beyond the classwork and personal projects I was accustomed to. 

Having previously applied a minimax algorithm for a class, I was keen to apply the algorithm to chess. A minimax algorithm is quite intuitive to understand; It is the simplest way to "see ahead". For every possible move, we simulate every possible enemy move, and then every response we may have, and so on and on. Each move we calculate the possibilities for is a single "depth" of the algorithm. Colloquially we may describe depth as "how many moves we see ahead".

Of course, the minimax algorithm grows exponentially; For every move we must consider every possibility, and so our runtime sits at O(nᵈ), d being our depth, and n being the average number of legal moves for all board positions we consider.

| Depth | Positions to check (~35 moves each) |
|---|---|
| 1 | 35 |
| 2 | 1,225 |
| 3 | 42,875 |
| 4 | 1.5 million |
| 5 | 52.5 million |
| 6 | 1.8 billion |

No chess engine can improve on this being the worst case, but there are huge speedups available to us through clever optimizations.

The first version of Arpeggio ran at a depth of 4. It had no concept of time control, castling (yikes), en passant or any optimization at all. Despite lacking the necessary apparatus to exhaustively test the engine, I estimated it's rating to be ~600, which was sufficient to hold a comfortable win-rate over me, rather embarrassingly. 

### Do we need to check every move?

This is the real meat and potatoes of engine programming. Having moved on from the project after the first draft of the chess engine, I returned in November 2026, committed to improving the engine. The first optimization I applied was alpha beta pruning; increasing depth from 4 to 5 proved infeasible with pure minimax, and I hoped to reach a depth of 6 with pruning implemented.

Say for any given chess position, we want to calculate 2 moves ahead (depth 2). We're white, so we check the first move and discover that it leads to us capturing a rook. We then consider all black's responses, and find that black's best available move in response is to take a bishop that fell under threat. This rook-for-bishop trade is favorable for white, which we note as +2 material and move on. 

![[arpeggio-assets/alphabeta-1-first-move.png]]

Considering white's next possible move, we once again observe black's responses. Finding black's first response takes our rook, we can stop considering positions immediately. This is called "pruning".

![[arpeggio-assets/alphabeta-2-second-move.png]]

Huh? We stop? Don't we need to consider every response Black has, not just this one?

We don't, because we already know that this move will at best lead to us losing a rook. Perhaps in Black's set of possible responses there exists a horrendous blunder, but Black certainly won't play it, since taking the rook is available. There may also exist a better move for Black than taking our rook, but we're uninterested in *how* much worse this move is than the last. We've already established it's worse, and any further investigation would be pointless.

Having concluded the second move is *at best* worse than our first move, so we don't need to waste time further contemplating other responses when we are primarily concerned with what move we should make at present.

An important takeaway from this example is that it's optimistic; Black likely had ~30-40 responses to choose from, and the move we so happened to check first was bad enough for White we could stop there, saving us the work of checking every other response. If this move happened to be the last we checked, we'd save no time at all, since we would have already done all the work of checking every other response.

This hints at the importance of move ordering, which concerns the order in which we collect moves for the engine to consider. The earlier we check the best moves, the more work we invariably save through pruning. More on this later!

### Follow-the-trades

No matter how large a depth an engine searches, there will always exist moves it doesn't see. More importantly for us, there will always exist a *first* move it doesn't see.

Say we're following our minimax algorithm, with a depth of 7, and we at last make it to the 7th potential move. At this point we've already considered millions of possible positions. Say that this 7th move has us (White) taking a rook. We aren't looking any further than this, so our engine concludes that this path results in gaining a rook, and so therefore the 7 moves that led us here are good moves.

But what about the trade? On the next move, Black can simply trade the piece back, and we haven't actually gained much. Of course this won't always be the case, but it opens a door for the engine to just be plain wrong. The algorithm may believe that sacrificing a knight now to gain a rook later is worthwhile, but if it doesn't see how capturing said rook is actually net neutral after the trade, that supposedly clever knight sacrifice is not more than a blunder.

This brings us to a crucial functionality for any chess engine: quiescence search. I personally prefer to call it the follow-the-trades search, but that makes for an uglier function signature.

Quiescence search forces the engine to leave no stone unturned vis-a-vis trades. Our main minimax search has a set depth, however, when reaching the final move in a series of moves, we must also explore every capture it opens up.

There is hardly a better demonstration of this than through a visual example. Although we may only be searching to a depth of 3, we must consider the string of trades left on the board, all the way until there are no captures remaining.

![[arpeggio-assets/qsearch-1-start.png]]
*White to move. Three white pieces attack the pawn on d5, and three black pieces defend it.*

![[arpeggio-assets/qsearch-2-horizon.png]]
*After 1. Nxd5 Nxd5 2. Bxd5, a depth-3 search stops here and concludes White has won a pawn.*

![[arpeggio-assets/qsearch-3-end.png]]
*After 2... Bxd5 3. Rxd5 Rxd5, the trades are over, and White is down the exchange and a pawn.*

In the example above, with a depth 3 search, the engine would conclude White has gained a pawn, and so the initial move of attacking the Black pawn is a good move. What it doesn't see is, after another 2 moves trading the bishop and rook, White is actually *down* a pawn. Quiescence search has the algorithm search through these trades, and prevents the engine from making incorrect assumptions.
### Testing, Properly

There's really only one way to properly test a chess engine, and it's what you might expect: loads, and loads, of games. Ideally, for a fully accurate rating we'd play ~4000 games in a "gauntlet" against different Stockfish versions. For instance, if one hypothesized the rating of an engine to be ~1800, we'd have it play 1000 games against each of Stockfish 1600, 1700, 1800, and 1900. The more games played, the greater the certainty of the engine's rating, with 1000 games bringing it to within 15 rating points of accuracy.

However,  before throwing an engine to the wolves, we must ensure it is able to speak the language of chess engines, UCI (Universal Chess Interface). Created by Rudolf Huber and Stefan Meyer-Kahlen in November 2000, it acts as a communication layer for stateless[^1] chess engines. Although UCI is expansive, the minimum compatibility requirements are simple, and can be implemented in an hour or two.

There's one last change to be made at this point. To make our chess engine time-aware, it's best not to have a set depth for our minimax function. Searching to a depth of 7 or 8 with only 0.4 seconds on the clock is unwise; the engine must adapt to the time constraints. The standard way to achieve this is with iterative deepening. We run our algorithm with depth 1, then 2, and so on and so forth. This of course repeats many calculations, but in our current state each depth is ~35 times more work than the last, and so this repeated work is considered negligible. With iterative deepening, no matter how quickly the engine must move, it always has access to the last depth's answer. 


Here's how the engine did:

![[arpeggio-assets/results-gauntlet-1.0.10.png]]

Not too shabby. Still, at this level, many human chess players could run rings around our engine. Not to worry, there's still two key improvements we'll be making.

### Move Ordering

When we discussed alpha-beta pruning earlier, we established something essential:

The time-save of alpha-beta is entirely dependent on how early the algorithm encounters strong moves.

To really demonstrate this effect, let's take a look at this position.

![[arpeggio-assets/ordering-hanging-queen.png]]
*White to move. Black's queen on g5 is hanging to the rook on g1.*

The astute among you will have noticed the hanging queen. As white-to-move, it's patently clear that's probably the best move, and we should make sure this move won't lead to any undesirable consequences down the line before simply capturing the queen.

However, at present, our chess engine thinks quite differently. It naively starts in the top left corner (a8), and works through the board square by square, left to right, rank by rank.

The desirable move is actually the last to be considered by this system, and the benefits of alpha-beta pruning are next to none. Ideally, the engine always check the best move first; but of course we can't know which move is best immediately. We can however, make certain educated guesses.

Introducing: MVV-LVA. It stands for Most Valuable Victim, Least Valuable Attacker. It's a method of ordering moves such that in positions just like the one highlighted above, we may reap the full benefits of alpha-beta pruning. We order moves such that we first check the moves taking the most valuable opponent piece with the least valuable ally piece. The highest ranking possible move in this system is taking a queen with a pawn, as they are the most valuable and least valuable pieces respectively.

With MVV-LVA move ordering implemented, let's have our new engine play against our old one.

![[arpeggio-assets/results-mvv-lva.png]]

That's quite a significant improvement, as predicted. There's far more that can be done in the world of move ordering, but for now we'll move on to our final (and my personal favorite) optimization.

### Transposition Tables

For most chess positions, there are uncountable ways the game could have ended up in that position. In our world of minimax calculations, the engine may end up scoring the same position over and over again. This is of course not ideal; it would be easier if the engine could just "remember" every position it had seen before, and what the best move in that position was, so that if it ever came up again it could be saved the grief of recalculating from scratch. Unfortunately, with roughly 4.8 × 10⁴⁴ achievable chess positions, even the beefiest data center couldn't remember the best move in every possible position, let alone my laptop.

But there's a way. Although there may be roughly 4.8 × 10⁴⁴ achievable chess positions, no one game will ever possess all of them, and so perhaps we can find a way to efficiently store only the positions we've seen so far.

Fair warning; to folk who haven't interacted with hash tables before, the remainder of this article may be fairly confusing, but I'll try to condense this fairly broad topic into a few lines.

First, let's assign a certain amount of RAM we are willing to allocate just to remembering chess positions, say 64 megabytes. Our goal is to store as many possible chess position to best-move combinations in here as possible, but we have to store them in such a way they can be accessed efficiently.

Ideally, we'd be able to convert any chess position into a number, and then use that number to look up the best move for that position if we've seen it before. The established method to achieve this is Zobrist Hashing.

Zobrist Hashing converts chess positions into numbers of length 64 bits. Of course, there are far more chess positions than numbers of length 64 bits, so there will be significant overlap: 2 completely different chess positions will eventually produce the same number, and our engine may find itself attempting to apply the best move from one position to a completely different one. What's important to know is the chance of this happening - this is called a "collision", and, in a table of 64 megabytes will occur only once in about 4.4 trillion lookups.

This also helps with iterative deepening! The repeated work shrinks drastically with transposition tables and Zobrist Hashing, as now moving from depth 2 to 3 doesn't require a recalculation of every position to depth 2 anymore. 

### Conclusion

The final rating of Arpeggio, the chess engine in this article, was 2200. Still a ways from the 3600 of Stockfish, but a great start. I'm not sure at this time if I'll continue to improve upon the engine, but the process of learning about the decades and lifetimes of iteration behind bringing chess programming to where it is today was fantastic, and I do believe I achieved my initial goal of becoming a far better C++ programmer. 

### Sources (without which, I wouldn't have been able to get started):

- Sebastian Lague, [Coding Adventure: Chess](https://www.youtube.com/watch?v=U4ogK0MIzqk) (2021)
- [Minimax](https://www.chessprogramming.org/Minimax)
- [Negamax](https://www.chessprogramming.org/Negamax)
- [Point Value](https://www.chessprogramming.org/Point_Value)
- [Piece-Square Tables](https://www.chessprogramming.org/Piece-Square_Tables)
- [Alpha-Beta](https://www.chessprogramming.org/Alpha-Beta)
- [Horizon Effect](https://www.chessprogramming.org/Horizon_Effect)
- [Quiescence Search](https://www.chessprogramming.org/Quiescence_Search)
- [UCI](https://www.chessprogramming.org/UCI)
- [Iterative Deepening](https://www.chessprogramming.org/Iterative_Deepening)
- Sebastian Lague, [Coding Adventure: Making a Better Chess Bot](https://www.youtube.com/watch?v=_vqlIPDR2TU) (2023)
- [Move Ordering](https://www.chessprogramming.org/Move_Ordering)
- [MVV-LVA](https://www.chessprogramming.org/MVV-LVA)
- [Transposition Table](https://www.chessprogramming.org/Transposition_Table)
- [Zobrist Hashing](https://www.chessprogramming.org/Zobrist_Hashing)

[^1]: A stateless engine has no knowledge of game history; it simply absorbs a game position and outputs a best move.
