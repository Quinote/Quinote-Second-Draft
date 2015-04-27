/* QuiNote Software Group 2015
Author: Elliott Warkus

Contains methods for generating quizzes from a ParseResult object.

Access is via calls to makeQuiz(parseResult, optionList), and returns 
a Quiz object containing a number of questions.


TODO:
	- Avoid making undefined into identifier elements?
	- when receiving null results, readd elements to pool?
	- What about identical definitions?
	- Avoid parent definitions

*/

//**************************************
// GLOBAL VARIABLES
//**************************************

/* List of words not to remove from fill-in-the-blank questions
	[Under development]

   Includes:
	- articles
	- some prepositions
	- conjunctions
	- common conjugated verbs
*/
var FITB_filter = [
	"the", "a", "an",
	"to", "of", "in", 
	"and", "but", "or", "yet",
	"is", "are", "was", "were", "be"
];

//**************************************
// PROTOTYPE OBJECTS
//**************************************

////////////////////////
// Main return object //
////////////////////////

function Quiz(questions) {
	// currently only contains a list of questions
	
	this.questions = questions;
	this.index = 0;
	
	this.hasNext = function() {
		// return true if there are questions remaining in the quiz
		return this.index < this.questions.length;
	}
	
	this.getNext = function() {
		// get the next question in the quiz
		if (this.hasNext()) {
			var nextQuestion = this.questions[this.index];
			this.index++;
			return nextQuestion;
		} else {
			console.log("Error: no more questions.");
			return undefined;
		}
	}
	
	this.reset = function() {
		// reset the question index
		this.index = 0;
	}
	
	this.size = function() {
		return this.questions.length;
	}
			
}

////////////////////////

function OptionList(numberMC, numberFITB, numberTF) {
	// specifies the settings for quiz generation
	
	// limited for testing purposes
	this.numberOfQuestions = numberMC + numberFITB + numberTF;
	this.numberMC = numberMC;
	this.numberFITB = numberFITB;
	this.numberTF = numberTF;
	
	this.questionTypes = {
		"Multiple choice": numberMC, 
		"Fill-in-the-blank": numberFITB, 
		"True or false": numberTF
	};
}

function MultipleChoiceQuestion(element, identifier, answer, otherChoices, type) {
	this.element = element;
	this.identifier = identifier;
	this.answer = answer;
	this.otherChoices = otherChoices;
	this.type = type;

	
	this.getText = function() {
		if (type === "definition") {
			return "Which of the following is associated with \"" + this.identifier + "\"?";
		} else if (type === "list") {
			return "Which of the following belongs to \"" + this.identifier + "\"?";
		}
	}
	
	this.getAllAnswers = function() {
		// get list of all possible answers, randomized
		
		var buffer = this.otherChoices.slice();
		var index = Math.floor(Math.random()*buffer.length);
		buffer.splice(index, 0, this.answer);
		return buffer;
	}
}

function TrueFalseQuestion(element, identifier, definition, answer) {
	this.element = element;
	this.identifier = identifier;
	this.definition = definition;
	this.answer = answer;
	
	// TEMPORARY; REMOVE LATER (TODO)
	this.questionType = 3;
	/////////////////////////////////
	
	this.getText = function() {
		return "True or false: \"" + this.identifier + "\" is associated with \"" + this.definition + "\"";
	}
	
	this.text = "\"" + this.identifier + "\" is associated with " + "\"" + this.definition + "\"";
}

function FillInTheBlankQuestion(element, definitionString, startIndex, stopIndex, answer) {
	this.element = element;
	this.definitionString = definitionString;
	this.answer = answer;
	
	// TEMPORARY; REMOVE LATER (TODO)
	this.questionType = 2;
	/////////////////////////////////
	
	// unsure if these are needed
	this.startIndex = startIndex; 
	this.stopIndex = stopIndex;
	
	
	// TODO: metadata for location in notes
	
	this.getText = function() {
		return "Fill in the blank: \"" + this.definitionString + "\"";
	}
}
	

//**************************************
// FUNCTIONS
//**************************************

/////////////////////////
//  Main access method //
/////////////////////////

function makeQuiz(parseResult, optionList) {
	if (typeof optionList === "undefined") {
		optionList = new OptionList(10, 0, 0);
	}
	
	var generatedQuestions = [];
	var numberOfQuestions = Math.min(parseResult.parsedElements.length, optionList.numberOfQuestions);
	
	var identifierPool = parseResult.getIdentifiers();
	var mcIdentifierPool = mergeArrays(identifierPool, parseResult.getParents());
	console.log(parseResult.getIdentifiers(), mergeArrays(parseResult.getIdentifiers(), parseResult.getParents()));
	
	if (identifierPool.length < numberOfQuestions) {
		console.log("Error: not enough identifiers found to make " + numberOfQuestions + " questions");
	}
	var count = 0;
	for (var i = 0; i<optionList.numberMC; i++) {
		var newQuestion = undefined;
		
		// call makeMultipleChoiceQuestion until non-null result is found
		while (typeof newQuestion === "undefined") {
			// abort if identifierPool becomes empty
			if (mcIdentifierPool.length === 0) {
				console.log("Maximum questions fewer than requested");
				return new Quiz(generatedQuestions);
			}
			
			// set value of newQuestion
			newQuestion = makeMultipleChoiceQuestion(mcIdentifierPool, parseResult);
			count++;
			if (count > 1000) break;
		}
		generatedQuestions.push(newQuestion);
		remove(identifierPool, newQuestion.element);
	}
	for (var i = 0; i<optionList.numberFITB; i++) {
		var newQuestion = undefined;
		
		// call makeMultipleChoiceQuestion until non-null result is found
		while (typeof newQuestion === "undefined") {
			// abort if identifierPool becomes empty
			if (identifierPool.length === 0) {
				console.log("Maximum questions fewer than requested");
				return new Quiz(generatedQuestions);
			}
			
			// set value of newQuestion
			newQuestion = makeFillInTheBlankQuestion(identifierPool, parseResult);
			remove(mcIdentifierPool, newQuestion.element);
		}
		
		generatedQuestions.push(newQuestion);
	}
	for (var i = 0; i<optionList.numberTF; i++) {
		var newQuestion = undefined;
		
		// call makeMultipleChoiceQuestion until non-null result is found
		while (typeof newQuestion === "undefined") {
			// abort if identifierPool becomes empty
			if (identifierPool.length === 0) {
				console.log("Maximum questions fewer than requested");
				return new Quiz(generatedQuestions);
			}
			
			// set value of newQuestion
			newQuestion = makeTrueFalseQuestion(identifierPool, parseResult);
			remove(mcIdentifierPool, newQuestion.element);
		}
		
		generatedQuestions.push(newQuestion);
	}
	
	// FOR TESTING PURPOSES TODO //
	console.log(parseResult.aliases);
	//***************************//
	
	return new Quiz(generatedQuestions);
}

/////////////////////////

function makeMultipleChoiceQuestion(identifierPool, parseResult) {
	var element, identifier, correctAnswer, otherChoices, type;
	
	// remove one key or return if none remain
	if (identifierPool.length === 0) {
		console.log("Error: out of keys from which to generate questions");
		return undefined;
	} else {
		// select random element
		while (true) {
			element = removeRandomElement(identifierPool);
			if (element.definitions.length > 0) break;
			if (element.subelements.length > 0) break;
			if (identifierPool.length === 0) {
				console.log("Error: out of keys from which to generate questions");
				return undefined;
			}
		}
		identifier = element.getIdentifier();
	}

	// select one correct answer from possible definitions
	if (element.definitions.length > 0) {
		correctAnswer = randomElement(element.definitions);
		type = "definition";
	} else if (element.subelements.length > 0) {
		correctAnswer = randomElement(element.subelements).getIdentifier();
		type = "list";
	}
	
	// select three incorrect answers from other possible definitions
	otherChoices = [];
	if (type === "definition") {
		// copy definitions to new array
		var definitionPool = parseResult.definitions.slice();
		// ensure no answer overlap
		removeAll(definitionPool, element.definitions);
		
		for (var i=0; i<3; i++) {
			if (definitionPool.length === 0) {
				console.log("Insufficient input to produce identifier question.");
				return undefined;
			}
			// select random wrong answer
			var definition = removeRandomElement(definitionPool);
			
			otherChoices.push(definition);
		}
	} else if (type === "list") {
		var subelementPool = element.getSubelements();
		subelementPool.push(element);
		var elementPool = parseResult.parsedElements.slice();
		console.log(elementPool, subelementPool);
		
		removeAll(elementPool, subelementPool);
		
		for (var i=0; i<3; i++) {
			if (elementPool.length === 0) {
				console.log("Insufficient input to produce identifier question.");
				return undefined;
			}
			// select random wrong answer
			var element = removeRandomElement(elementPool);
			
			otherChoices.push(element.getIdentifier());
		}
	}
	
	return new MultipleChoiceQuestion(element, identifier, correctAnswer, otherChoices, type);
}

function makeTrueFalseQuestion(identifierPool, parseResult) {
	var identifier, definition, answer;
	
	// select base element
	var element = removeRandomElement(identifierPool);
	identifier = element.getIdentifier();
	
	// choose whether to do true or false
	var isTrue = true;
	if (Math.random() > .5) isTrue = false;
	
	if (isTrue) {
		answer = "true";
		
		// get random correct answer
		definition = randomElement(element.definitions);
	} else {
		answer = "false";
		
		// this is extra-naive: get a random incorrect answer from
		// pool of all definitions
		var definitionPool;
		if (element instanceof DateElement) {
			definitionPool = parseResult.events.slice();
		} else if (element instanceof IdentifierElement) {
			definitionPool = parseResult.definitions.slice();
		}
		removeAll(definitionPool, element.definitions);
		definition = randomElement(definitionPool);
	}
	
	return new TrueFalseQuestion(element, identifier, definition, answer);
}

function makeFillInTheBlankQuestion(identifierPool, parseResult) {
	// basic, naive fill-in-the-blank question generator
	
	var definitionString, startIndex, stopIndex, answer;
	
	// select base element
	var element = removeRandomElement(identifierPool);
	// select one of its definitions
	var definition = randomElement(element.definitions);
	
	var definitionString = element.getIdentifier() + ": " + definition;
	
	// remove one legal word from the definitionString
	var wordlist = definitionString.split(" ");
	startIndex = -1;
	while (startIndex === -1) {
		if (wordlist.length === 0) {
			console.log("Error: this element cannot be made into a FITB question");
			return null;
		}
		answer = removeRandomElement(wordlist);
		if (answer.substring(answer.length-1) === ":") {
			answer = answer.substring(0, answer.length-1);
		}
		//test to see if removed word is in prohibited list
		if ($.inArray(answer, FITB_filter) === -1) {
			startIndex = definitionString.indexOf(answer);
		}
	}
	
	stopIndex = startIndex + answer.length;
	
	var blankString = "";
	for (var i=0; i<answer.length; i++) {
		blankString += "_";
	}
	
	definitionString = definitionString.substring(0, startIndex) 
		+ blankString + definitionString.substring(stopIndex);
	
	return new FillInTheBlankQuestion(element, definitionString, startIndex, stopIndex, answer);
}

function remove(array, element) {
	while (array.indexOf(element) > 0) {
		array.splice(array.indexOf(element), 1);
	}
}

function removeAll(targetArray, elementsToRemove) {
	// remove all elements in elementsToRemove from targetArray
	for (i in elementsToRemove) {
		var index = $.inArray(elementsToRemove[i], targetArray);
		while (index > -1) {
			targetArray.splice(index, 1);
			index = $.inArray(elementsToRemove[i], targetArray);
		}
	}
}

function randomIndex(array) {
	// get random legal index into array
	// returns 0 if array is empty
	var index =  Math.floor(Math.random()*array.length);
	return index;
}

function randomElement(array) {
	// get random element of array
	if (array.length === 0) {
		console.log("Error: array is empty.");
		return null;
	}
	return array[randomIndex(array)];
}

function removeRandomElement(array) {
	// remove and return a random element from array
	if (array.length === 0) {
		console.log("Error: array is empty.");
		return null;
	}
	return array.splice(randomIndex(array), 1)[0];
}

function mergeArrays(arr1, arr2) {
	// merge the contents of two arrays, removing duplicates
	
	var ret = arr1.slice();
	
	for (var i in arr2) {
		if (ret.indexOf(arr2[i]) === -1) {
			ret.push(arr2[i]);
		}
	}
	return ret;
}

















