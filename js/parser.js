/* QuiNote Software Group 2015
Author: Elliott Warkus

Contains methods for parsing textual input.

Access is via calls to parseInput(html), where html is a string of raw HTML consistent 
with the text editor formatting, and returns a ParseResult object, which consists
of arrays of objects.

TODO: 
	- ordered lists (?)

	- Anonymous labels not incrementing
	- Whitespace definitions (?) 
	- post-list identifiers not being recognized
	- copy-paste issues (format from outside input?)
	- newlines in copy/paste: not being split (because not <br>s)
	- shorten notes in sidebar (part of editor.js)
*/

//**************************************
// GLOBAL VARIABLES
//**************************************

var aliasRegex = /\[.*\]/; 
var aliasSeparatorRegex = /;|,/;
var ideaRegex = /([^:])+/;
var equalityRegex = /:/; // currently unused; may be expanded

// these need to be global because of recursive scoping issues
// alternative would be recursive construction of a ParseResult
//
// prepended "parser_" to eliminate namespace issues
var parser_parsedElements = [];
var parser_identifiers = [];
var parser_definitions = [];
var parser_other = [];
var parser_aliases = [];

var parser_anonCount = 1; // count of "nameless" identifiers
var parser_nameSet = {}; // map of identifiers/aliases to parseElements
var parser_representedElements = []; // list of identifiers already represented



//**************************************
// PROTOTYPE OBJECTS
//**************************************

////////////////////////
// Main return object //
////////////////////////

function ParseResult(parsedElements, identifiers, definitions, aliases, nameSet, other) {
	this.parsedElements = parsedElements;
	this.identifiers = identifiers;
	this.definitions = definitions;
	this.aliases = aliases;
	this.nameSet = nameSet;
	this.other = other;
	
	this.getIdentifiers = function () {
		// return an array of all Identifier Elements
		
		var identifierPool = this.identifiers.slice();
		return identifierPool;
	}
	
	this.getElementByKey = function (key) {
		/* given an identifier string, try to return the Element 
		   associated with that identifier */
				
		var ret = parser_nameSet[key];
		
		if (typeof ret === "undefined") {
			console.log("Element not found in call to getElementByKey: " + key);
		}
		
		return ret;
	}
}

////////////////////////

function RawElement(value) {
	/* A RawElement is an unparsed line. The structure of a 
		RawElement reflects only indentation level organization */
	
	this.value = value; 
	this.parent; 
	this.subelements = [];
}

function IdentifierElement (identifier) {
	/* An IdentifierElement contains, at the bare minimum,
		an identifier. It may also contain a DefinitionElement 
		(making it a definition type) and any number of nested
		subelements (making it a list).
	*/
	
	this.identifier = identifier;
	this.aliases = []; 
	this.definitions = []; 
	this.parent;
	this.subelements = []; 
	
	this.setIdentifier = function(identifier) {
		this.identifier = identifier;
	}
	this.getIdentifier = function(identifier) {
		return this.identifier;
	}
}

// deprecated; currently here to avoid breaking code in other locations
function DateElement () {}


//*************************************
// FUNCTIONS
//*************************************

/////////////////////////
//  Main access method //
/////////////////////////

function parseInput() {
	/* Given the html input, first assign hierarchy based on indent
	levels then parse according to parse rules. Returns a ParseResult
	object containing the results of the final parsing function
	*/
	
	// reset state of global variables for new parse
	resetState();
	
	/* split HTML by linebreaks (<br>)
	 *
	 * reductiveSplit() is currently located in editor.js
	 */
	
	
	var html = getEditorHtml();
	
	// eliminate zero-width spaces (U+200B)
	html = html.replace(/\u200B+/g, "");
	
	// replace newlines with <br> tags
	html = html.replace(/\n+/g, "<br>");

	var elements = reductiveSplit(html, "<br />");
	console.log(html);
	

	// [temp?] fix for issue of mid-list <br>s being inserted
	// essentially, re-merge erroneously separated lists
	var numElements = elements.length-1;
	for (var i=0; i<numElements; i++) {
		if (elements[i].length > 3 && elements[i+1].length > 4) {
			if (elements[i].substring(elements[i].length-4, elements[i].length) === "<li>" &&
				elements[i+1].substring(0, 5) === "</li>") {
						
				elements[i] = elements[i] + elements[i + 1];
				elements.splice(i+1, 1);
				numElements--;
			}
		}
	}	
	
	// get list of top-level elements containing their subelements
	var rawElements = [];
	
	for (var i=0; i<elements.length; i++) {
		// recursively parse if element contains a list
		if (elements[i].indexOf("<ul>") !== -1 ) {
			
			// strip off proceeding element, if present
			var proceedingElement = elements[i].substring(elements[i].lastIndexOf("</ul>") + 5);
			
			// read list + top-level element
			rawElements.push(readLists(elements[i].substring(0, elements[i].lastIndexOf("</ul>"))));
			
			// re-add proceeding element, if applicable
			if (proceedingElement.length > 0) {
				rawElements.push(new RawElement(proceedingElement));
			}
		} else if (elements[i].length > 0 && !isWhitespace(elements[i])) {
			//otherwise, just push top-level element
			rawElements.push(new RawElement(elements[i]));
		}
	}
				
	for (var i=0; i<rawElements.length; i++) {
		// ignore empty lines
		if (rawElements[i].value.length === 0) continue;
		
		// parse indent-organized RawElements
		var parsedElement = parseRawElement(rawElements[i]);
		
		// check if element already contained in sidebar representation		
		if (parser_representedElements.indexOf(parsedElement.getIdentifier()) === -1) {
			parser_parsedElements.push(parsedElement);
		}
		
		updateRepresentedElements(parsedElement);
	}
	
	// set identifiers for "anonymous" elements
	for (var i=0; i<parser_parsedElements.length; i++) {
		setAnons(parser_parsedElements[i]);
	}
	
	var parseResult = new ParseResult(parser_parsedElements, parser_identifiers, parser_definitions, parser_nameSet, parser_other);
		
	//console.log(parser_representedElements, parseResult);
			
	return parseResult;
}

/////////////////////////

function readLists(element) {
	// recursively process subordinate elements in a list
	
	// strip off top-level identifier/definition
	var contents = element.split(/<ul>(.+)/);
	console.log(contents);
	
	var newElement = new RawElement(contents[0]);
	
	if (typeof contents[1] !== "undefined" && contents[1].length > 0) {
		// parse subordinate elements and assign to subelements field
		newElement.subelements = processListElements(contents[1]);
	}
	
	// assign parent pointers
	for (var i=0; i<newElement.subelements.length; i++) {
		newElement.subelements[i].parent = newElement;
	}
	
	return newElement;
}

function processListElements(contents) {
	// given a string representing the contents of a list, recursively
	// process the contents of that list as RawElements
	
	 // string leading and trailing <li> and </li>
	contents = contents.substring(4, contents.length-5);
	
	
	var startIndex = 0;
	var stopIndex = 0;
	var subelements = [];
	while (stopIndex < contents.length) {
		
		while (contents.charAt(stopIndex) !== "<" && stopIndex < contents.length) stopIndex++;
		if (contents.substring(stopIndex, stopIndex + 4) === "<ul>") {
			
			var pointer = stopIndex + 1;
			var openLists = 1;
			var closedLists = 0;
			
			while (openLists > closedLists) {
				pointer++;
				if (contents.substring(pointer, pointer + 4) === "<ul>") {
					openLists++;
				} else if (contents.substring(pointer, pointer + 5) === "</ul>") {
					closedLists++;
				}
			}
			
			
			subelements.push(readLists(contents.substring(startIndex, pointer)));
			startIndex = pointer;
			stopIndex = pointer;
			
		} else if (contents.substring(stopIndex, stopIndex + 4) === "<li>") {
			startIndex = stopIndex + 4;
			stopIndex = stopIndex + 4;
		} else if (contents.substring(stopIndex, stopIndex + 5 === "</li>")) {
			var current = contents.substring(startIndex, stopIndex);
			if (!isWhitespace(current)) {
				subelements.push(new RawElement(contents.substring(startIndex, stopIndex)));
			}
			startIndex = stopIndex + 5;
			stopIndex = stopIndex + 5;
		}
	}
	
	return subelements;
}
	
function countSubelements(rawElement) {
	// recursively determine the number of subelements in a parent Element's tree			
	var count = rawElement.subelements.length;
	for (var i=0; i<rawElement.subelements.length; i++) {
		count += countSubelements(rawElement.subelements[i]);
	}
	return count;
}

function parseRawElement(rawElement) {
	/* recursively turn RawElements into their respective 
	IdentifierElement forms */
	
	var newElement;
	var aliases;
	
	// split by colon 
	var components = rawElement.value.split(":");
	for (i in components) {
		// strip leading/following whitespace
		components[i] = components[i].trim();
	}
	
	// assign a temp name to anonymous identifiers
	if ((components[0].length === 0 || components[0] === "\u200B") && components.length > 1) {
		components[0] = "["; 
	}
	
	// test for presence of aliases
	if (components.length > 1 && aliasRegex.test(components[0])) {
		// extract aliases
		var aliasExec = aliasRegex.exec(components[0]);
		aliases = aliasExec[0];
		
		// strip brackets
		aliases = aliases.substring(1, aliases.length-1);
		
		// split apart list by semicolon or comma
		aliases = aliases.split(aliasSeparatorRegex);
		for (var i=0; i<aliases.length; i++) {
			// trim whitespace
			aliases[i] = aliases[i].trim();
		}
		
		// set components[0] (the identifier) to itself less alias construction
		components[0] = components[0].substring(0, aliasExec.index);
		
		// trim any new whitespace
		components[0] = components[0].trim();
	}
	
	// if identifier previously defined, it will be in nameSet;
	// else newElement remains undefined
	newElement = parser_nameSet[components[0]];	
	
	// define newElement if no identifier/alias matches are found
	if (typeof newElement === "undefined") {

		newElement = new IdentifierElement(components[0]);
		
		if (components.length > 1) {
			parser_identifiers.push(newElement);
		}
	}
	
	// set/add aliases if applicable
	if (typeof newElement !== "undefined" && typeof aliases !== "undefined") {
		
		// case aliases previously undefined
		if (newElement.aliases.length === 0) {
			newElement.aliases = aliases;
			
		// case aliases previously defined
		} else {
			newElement.aliases = mergeArrays(newElement.aliases, aliases);
			parser_aliases = mergeArrays(parser_aliases, aliases);
		}
	}
	
	// test if definition present
	if (components.length === 2 && components[1] != "") {
		// split definitions by semicolon
		var elementDefinitions = components[1].split(";");
		for (i in elementDefinitions) {
			elementDefinitions[i] = elementDefinitions[i].trim();
		}
		
		// merge definitions of element
		newElement.definitions = newElement.definitions.concat(elementDefinitions);
		
		// add new definitions to relevant parser pools
		if (newElement instanceof IdentifierElement) {
			for (i in elementDefinitions) {
				parser_definitions.push(elementDefinitions[i]);
			}
		}
		
	} else {
		// if not, element is free-floating
		if (typeof newElement === "undefined") {
			newElement = new IdentifierElement(components[0]);
		}
		parser_other.push(newElement);
	}
	
	// set new entries in nameSet from identifiers/aliases to Element object
	parser_nameSet[newElement.getIdentifier()] = newElement;
	
	for (var i=0; i<newElement.aliases.length; i++) {
		if (typeof parser_nameSet[newElement.aliases[i]] === "undefined") {
			parser_nameSet[newElement.aliases[i]] = newElement;
		}
	}
	
	// recurse on subelements
	for (var i=0; i<rawElement.subelements.length; i++) {
		var subelement = parseRawElement(rawElement.subelements[i]);
		
		// avoid ugly philosophical (and practical--endless recursion)
		// self-containment issues, elements cannot contain themselves
		if (subelement !== newElement) {
			newElement.subelements.push(subelement);
		}
	}
	
	// update parent pointers, if applicable
	for (var i=0; i<newElement.subelements.length; i++) {
		newElement.subelements[i].parent = newElement;
	}

	return newElement;
}

function setAnons(parseElement) {
	// recursively replace "anonymous" identifiers with numbered labels
	
	if (parseElement.getIdentifier() === "[") {
		parseElement.setIdentifier("[" + parser_anonCount + "]");
		parser_anonCount++;
	}
	
	// recurse 
	for (var i=0; i<parseElement.subelements.length; i++) {
		setAnons(parseElement.subelements[i]);
	}
}

function updateRepresentedElements(parseElement) {
	// update list of elements represented in sidebare
	
	if (parser_representedElements.indexOf(parseElement.getIdentifier()) === -1) {
		parser_representedElements.push(parseElement.getIdentifier());
	}
	
	// recurse on subelements
	for (var i=0; i<parseElement.subelements.length; i++) {
		updateRepresentedElements(parseElement.subelements[i]);
	}
}

function resetState() {
	// Reset relevant global variables 
	
	// clear global arrays
	parser_parsedElements = [];
	parser_identifiers = [];
	parser_definitions = [];
	parser_other = [];
	
	// reset other procedural variables
	parser_anonCount = 1;
	parser_nameSet = {};
	parser_representedElements = [];
}

function isWhitespace(string) {
	// test to see if a string consists *entirely* of whitespace and/or U+200B
	
	return /^(\s|\u200B)+$/.test(string);
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

