Character = require "./character.coffee"

class Spock extends Character
	
	constructor: ->
		super
		@name = "Spock"
		@image = "images/spock.jpg"
	
	buildReplies: ->
		@replies.push "It is curious how often you humans manage to obtain that which you do not want."
		@replies.push "I am endeavoring, ma'am, to construct a mnemonic circuit using stone knives and bearskins."
		@replies.push "I have never understood the female capacity to avoid a direct answer to any question."
		@replies.push "If there are self-made purgatories, then we all have to live in them. Mine can be no worse than someone else's."
		@replies.push "Logic is a little tweeting bird chirping in meadow. Logic is a wreath of pretty flowers that smell bad."
		@replies.push "Your illogical approach to chess does have its advantages on occasion."
		@replies.push "After a time, you may find that having is not so pleasing a thing, after all, as wanting. It is not logical, but it is often true."
		@replies.push "Computers make excellent and efficient servants, but I have no wish to serve under them."
		@replies.push "Judging by the pollution content of the atmosphere, I believe we have arrived at the late twentieth century."
		@replies.push "They like you very much, but they are not the hell your whales."
		@replies.push "Nowhere am I so desperately needed as among a shipload of illogical humans."
		@replies.push "On my planet \"to rest\" is to rest, to cease using energy. To me it is quite illogical to run up and down on green grass using energy instead of saving it."
		@replies.push "Fascinating is a word I use for the unexpected. In this case, I should think \"interesting\" would suffice. "
		@replies.push "You almost make me believe in luck."
		@replies.push "If I seem insensitive to what you’re going through understand – it’s the way I am."
		@replies.push "May I say that I have not thoroughly enjoyed serving with Humans? I find their illogic and foolish emotions a constant irritant."
		@replies.push "Fortunately, my ancestors spawned in another ocean than yours did. My blood cells are quite different."
		@replies.push "Your logic was impeccable. We are in grave danger."
		@replies.push "Interesting. You Earth people glorify organized violence for 40 centuries, but you imprison those who employ it privately."
		@replies.push "Where there is no emotion, there is no motive for violence."
		@replies.push "Has it occurred to you that there is a certain inefficiency in constantly questioning me on things you’ve already made up your mind about?"
		@replies.push "A very interesting game, this poker."
		@replies.push "This troubled planet is a place of the most violent contrasts. Those who receive the rewards are totally separated from those who shoulder the burdens. It is not a wise leadership."
		@replies.push "The most unfortunate lack in current computer programming is that there is nothing available to immediately replace the starship surgeon."
		@replies.push "Pain is a thing of the mind. The mind can be controlled."
		@replies.push "Being a red blooded human clearly has it’s disadvantages."
		@replies.push "Frankly, I was rather dismayed by your use of the term 'half-breed'. You must admit it is an unsophisticated expression."
		@replies.push "In critical moments men sometimes see exactly what they wish to see."

module.exports = Spock