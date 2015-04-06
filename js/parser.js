/* QuiNote Software Group 2015
Author: Elliott Warkus

Contains methods for parsing textual input.

Access is via calls to parseInput(elements), where elements is an array 
of newline-separated strings, and returns a ParseResult object, which consists
of arrays of (possibly nested) objects. 

TODO: 
	- ordered lists
	- create an emptyRegex to identify whitespace

	- BIG BUG: creating a list and then deleting the contents of the first 
		point introduces an unexpected <br>!
*/

//**************************************
// GLOBAL VARIABLES
//**************************************

// var dateRegex = /[0-9]+-[0-9]+-[0-9]+/; DEPRECATED
var aliasRegex = /\[.*\]/;
var aliasSeparatorRegex = /;|,/;
var ideaRegex = /([^:])+/;
var equalityRegex = /:/; // currently unused; may be expanded
var listBeginRegex = /<ul>/;
var listEndRegex = /<\/ul>/;


// these need to be global because of recursive scoping issues
// alternative would be recursive construction of a ParseResult
//
// prepended "parser_" to eliminate namespace issues
var parser_parsedElements = [];
var parser_identifiers = [];
// var parser_dates = []; // DEPRECATED; to be fully removed later
var parser_definitions = [];
// var parser_events = []; // DEPRECATED
var parser_other = [];
var parser_aliases = [];



//**************************************
// PROTOTYPE OBJECTS
//**************************************

////////////////////////
// Main return object //
////////////////////////

function ParseResult(parsedElements, identifiers, definitions, aliases, other) {
	this.parsedElements = parsedElements;
	this.identifiers = identifiers;
	//this.dates = dates; // DEPRECATED
	this.definitions = definitions;
	//this.events = events; // DEPRECATED
	this.aliases = aliases;
	this.other = other;
	
	this.getIdentifiers = function () {
		// return an array of all Identifier Elements
		var identifierPool = [];
		for (i in this.identifiers) {
			identifierPool.push(this.identifiers[i]);
		}
		/*for (i in this.dates) {
			identifierPool.push(this.dates[i]);
		}*/
		return identifierPool;
	}
	
	this.getElementByKey = function (key) {
		/* given an identifier string, try to return the Element 
		   associated with that identifier */
		for (i in this.identifiers) {
			if (this.identifiers[i].identifier === key) {
				return this.identifiers[i];
			}
		}
		/*for (i in this.dates) {
			if (this.dates[i].date === key) {
				return this.dates[i];
			}
		}*/
		
		console.log("Element not found in call to getElementByKey: " + key);
		return undefined;
	}
}

////////////////////////

function RawElement(value) {
	/* A RawElement is an unparsed line. The structure of a 
		RawElement reflects only indentation level organization
	*/
	this.value = value; // Identifier and possibly definition
	this.parent; // Parent RawElement, if applicable
	this.subelements = [];
}

function IdentifierElement (identifier) {
	/* An IdentifierElement contains, at the bare minimum,
		an identifier. It may also contain a DefinitionElement 
		(making it a definition type) and any number of nested
		subelements (making it a list).
	
	*/
	this.identifier = identifier;
	this.aliases = []; // a list of other names by which this element may be known
	this.definitions = []; // to be set if applicable
	this.subelements = []; // to be appended to if applicable
	
	this.setIdentifier = function(identifier) {
		this.identifier = identifier;
	}
	this.getIdentifier = function(identifier) {
		return this.identifier;
	}
}

function DateElement (date) {
	/* ******************************************************
	   AS OF 4-5-15, THIS CLASS IS DEPRECATED, TO BE REPLACED
	   BY THE UNIVERSAL "IDENTIFIER : DEFINITION" MODEL
	   ******************************************************
	
	/* Like an IdentifierElement, a DateElement contains at
		least a date and possibly a definition and/or list.
	
		As a class of identifier, date fields are a special 
		subset of normal identifiers.
	*/
	this.date = date;
	this.aliases = []; // a list of other names by which this element may be known
	this.definitions = [];
	this.subelements = [];
	
	this.setIdentifier = function(identifier) {
		if (!dateRegex.test(identifier)) {
			console.log("WARNING: setting DateElement identifier " + this.identifier + " to non-date " + identifier);
		}
		this.date = identifier;
	}
	this.getIdentifier = function(identifier) {
		return this.date;
	}
	
}

function OtherElement (value) {
	/* An element which could not be parsed into a recognized
		category.
	
		CURRENTLY UNUSED
	*/
	this.value = value;
}

//*************************************
// FUNCTIONS
//*************************************

/////////////////////////
//  Main access method //
/////////////////////////

function parseInput(html) {
	/* Given the html input, first assign hierarchy based on indent
	levels then parse according to parse rules. Returns a ParseResult
	object containing the results of the final parsing function
	*/
	
	// reset state of global variables for new parse
	resetState();
	
	// split HTML by linebreaks (<br>)
	var elements = reductiveSplit(getEditorHtml(), "<br>");
		
	// get list of top-level elements containing their subelements
	var rawElements = [];
	
	for (var i in elements) {
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
		} else if (elements[i].length > 0) {
			//otherwise, just push top-level element
			rawElements.push(new RawElement(elements[i]));
		}
	}
			
	for (var i=0; i<rawElements.length; i++) {
		// ignore empty lines
		if (rawElements[i].value.length === 0) continue;
		
		// parse indent-organized RawElements
		var parsedElement = parseRawElement(rawElements[i]);
		
		// check if element already contained
		if (parser_parsedElements.indexOf(parsedElement) === -1) {
			parser_parsedElements.push(parsedElement);
		}
	}
	
	var parseResult = new ParseResult(parser_parsedElements, parser_identifiers, parser_definitions, parser_other);
	return parseResult;
}

/////////////////////////

function readIndentLevels (elements, index, indentationLevel) {
	/* TO BE DEPRECATED WITH INTRODUCTION OF HTML LIST ORDERING
	   (4-5-15)
	
	/* given line-by-line input array elements, 
		recursively parse those lines (in-order)
		and their subelements
	*/
	var indentLevelElements = [];
	
	while (index < elements.length) {
		
		// note: format of element depends on surrounding API
		var val = elements[index];
		
		// get indentation level of current element
		var currentIndentation = getIndentationLevel(val); 
		
		// if indent level is less, then current hierarchy is done
		if (currentIndentation < indentationLevel) return indentLevelElements;
		
		var currentElement = new RawElement(val);
		indentLevelElements.push(currentElement);
		index++;
		
		// if has subelements, recurse on them
		if (index < elements.length) {
			var nextIndentation = getIndentationLevel(elements[index]);
			
			if (nextIndentation < indentationLevel) {
				// current hierarchy is complete; return 
				return indentLevelElements;
			} else if (nextIndentation === indentationLevel) {
				// non-subordinate element follows
				continue;
			} else {
				// otherwise, current element is a list; make recursive call
				currentElement.subelements = readIndentLevels(elements, index, nextIndentation);
				
				// assign currentElement to parent field of subelements
				for (var i in currentElement.subelements) {
					currentElement.subelements[i].parent = currentElement;
				}
				
				// increase index by size of list (recursive call)
				index += countSubelements(currentElement);
			}
		}
	}
	return indentLevelElements;
}

function readLists(element) {
	// recursively process subordinate elements in a list
	
	// strip off top-level identifier/definition
	var contents = element.split(/<ul>(.+)/);
	
	var newElement = new RawElement(contents[0]);
	
	if (typeof contents[1] !== "undefined" && contents[1].length > 0) {
		// parse subordinate elements and assign to subelements field
		newElement.subelements = processListElements(contents[1]);
	}
	
	return newElement;
}

function processListElements(contents) {
	// given a string representing the contents of a list, recursively
	// process the contents of that list as RawElements
	
	 // string leading and trailing <li> and </li>
	contents = contents.substring(4, contents.length-5);
	
	// split by list element breaks
	var listElements = contents.split("</li></li>");
	
	var subelements = [];
	
	for (var i in listElements) {
		// recurse on further sublists, if present
		if (listElements[i].indexOf("<ul>") !== -1 ) {
			var proceedingElement = listElements[i].substring(listElements[i].lastIndexOf("</ul>") + 5);
			
			subelements.push(readLists(listElements[i].substring(0, listElements[i].lastIndexOf("</ul>"))));
			
			if (proceedingElement.length > 0) {
				subelements.push(new RawElement(proceedingElement));
			}
			
		// otherwise, just add a new RawElement
		} else {
			subelements.push(new RawElement(listElements[i]));
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
	IdentifierElement or DateElement forms 
	*/
	
	var newElement;
	var aliases;
	
	// split by colon 
	var components = rawElement.value.split(":");
	for (i in components) {
		// strip leading/following whitespace
		components[i] = components[i].trim();
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
		for (i in aliases) {
			// trim whitespace
			aliases[i] = aliases[i].trim();
		}
		// set components[0] (the identifier) to itself less alias construction
		components[0] = components[0].substring(0, aliasExec.index);
		// trim any new whitespace
		components[0] = components[0].trim();
	}
	
	for (var i in parser_parsedElements) {
		// check to see if identifier previously defined
		// is there a way to improve this over O(n)?
		// ... becomes a possible concern with large input size
		
		var currentElement = parser_parsedElements[i];
		
		if (currentElement.getIdentifier() === components[0]) {
			// if so, define "newElement" to be the previously defined element
			newElement = currentElement;
			
			// element found; break out of for loop
			break;
		}
		
		for (var j in currentElement.aliases) {
			if (currentElement.aliases[j] === components[0]) {
				newElement = currentElement;
				
				break;
			}
		}	
	}
	
	if (typeof newElement === "undefined") {
		// define newElement if no identifier/alias matches are found
		
		/*if (dateRegex.test(components[0]) ) {
			// make new element
			newElement = new DateElement(components[0]);

			if (components.length > 1) {
				parser_dates.push(newElement);
			}
		} else */
			
		// At the moment, this is largely a formality: ideaRegex will match
		// virtually any input (consequence of eliminating DateElements
		if (ideaRegex.test(components[0]) ) {
			newElement = new IdentifierElement(components[0]);
		
			if (components.length > 1) {
				parser_identifiers.push(newElement);
			}
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
		
		/*if (newElement instanceof DateElement) {
			for (i in elementDefinitions) {
				parser_events.push(elementDefinitions[i]);
			}
		} else */
			
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
	
	for (var i=0; i<rawElement.subelements.length; i++) {
		// recurse on subelements
		newElement.subelements.push(parseRawElement(rawElement.subelements[i]));
	}

	return newElement;
}

function getIndentationLevel(str) {
	// count the indentation level of the given string
	
	var count = 0;
	
	// test for tabs (\t) at the beginning of the string
	while (/^\t/.test(str)) {
		str = str.replace("\t", "");
		count++;
	}
	return count;
}

function resetState() {
	// Reset relevant global variables 
	
	// clear global arrays
	parser_parsedElements = [];
	parser_identifiers = [];
	//parser_dates = []; // DEPRECATED
	parser_definitions = [];
	//parser_events = []; // DEPRECATED
	parser_other = [];
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