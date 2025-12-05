# GD Skillsetguessr

A game where you get shown a Geometry Dash level, and must guess its skillsets and difficulty.

## How to play

On the main screen, you will be able to choose between 2 datasets. **AREDL** chooses levels and corresponding skillsets (and difficulties) from the AREDL, while **GDDL** chooses levels and corresponding skillsets (and difficulties) from the GDDL. You are also able to choose between wheter you would like to do 5 rounds, 10 rounds, 15 rounds, 20 rounds, or 25 rounds.

Upon choosing, you get shown a level's video. Based on this video, you must guess the skillsets of this level, and what difficulty you think it is. After guessing, hit the "Guess!" button and your score should show up. How this score is calculated is explained in the "Point calculation" section of this README. After all rounds are up, you get shown a recap with your points during every round, your total points, and a return to main menu button. This button effectively does the same as refreshing your page. 

## Point calculation

The points you gain are split up in a Difficulty section, and a Skillset section. Skillsets account for 75% of your total points (3750), while Difficulty accounts for the remaining 25% (1250). These are added up and multiplied by a number depending on the amount of wrong skillsets. The exact formulas are given below:

### AREDL

Difficulty: $ 1250 - (guess^{\frac{5}{6}}-actual^{\frac{5}{6}})^{2} $

Skillsets: $ \frac{correct}{total} \cdot 3750$

Multiplier: $ 0.9^{wrong} $

### GDDL

Difficulty: $ \sqrt{49-3(guess-actual)^{2}} \cdot \frac{1250}{7} $

Skillsets*: $ \frac{totalVotesOfRelevantGuesses}{totalVotesOfRelevantSkillsets} \cdot 3750 $

Multiplier*: $ 0.9^{wrong} \cdot 0.95^{irrelevant} $

\* <sub>GDDL skillset guesses are split into 4 categories, always being categorized into the lowest one that applies:
- relevant (The main skillsets)
- semirelevant (Any skillset that has less than 20% of the votes of the most commonly voted skillset)
- irrelevant (Skillsets that are not in the top 7 most voted)
- wrong (Everything that is not in the list of skillsets)</sub>

## Credits

[The All Rated Extreme Demons List](https://aredl.net/)
- [API](https://api.aredl.net/v2/docs)

[Geometry Dash Demon Ladder](https://gdladder.com)
- [API](https://gdladder.com/api/docs)

[TomSelect](https://tom-select.js.org/)

and of course, [Geometry Dash](https://store.steampowered.com/app/322170/Geometry_Dash/)