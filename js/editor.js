/* Quinote Software Group 2015
 *
 * Author(s): Cameron Basham, Elliott Warkus, Simone Dozier
 *
 *
 *
 * TODO:
 *    - Hook up toolbar buttons
 *    - Update parser on paste, undo, redo, general entry
 *      • Make sure update is AFTER the entry
 *    - Fix quirky tab behavior
 *    - Fix quirky delete behavior (when deleting a range including list items)
 */

var editorMain = function() {
    tinymce.EditorManager.init({
        selector: 'textarea',
        menubar: false,
        statusbar: false,
        auto_focus : 'editor_div',
        paste_text_sticky_default: true,
        paste_text_sticky: true,

        // TESTING ----
        //force_br_newlines: false,
        //convert_newlines_to_brs: true,
        // ------------

        //toolbar: false,
        forced_root_block: false,
        invalid_elements: 'div',
        setup: function(ed) {
            //$.each(['paste', 'cut', 'keyup', 'undo', 'redo'], function(index, value) {
            //    ed.on(value, buildList(parseEditorText()));
            //});
            ed.on('keydown', function(event) {
                //console.log([getEditorHtml()]);
                //console.log(event);
                if (event.keyCode === 9) { // tab pressed
                    if (event.shiftKey) {
                        handleOutdent(ed);
                    } else {
                        handleIndent(ed);
                    }

                    event.preventDefault();
                    return false;
                }
                //buildList(parseEditorText());
            });
            ed.on('keyup', function(event) {
                buildList(parseEditorText());
                //console.log( {html: ed.getContent({format: 'raw'})} );
                //console.log( {html: ed.getContent()} );
            });
        }
    });

    var handleIndent = function(editorInstance) {
        var sel = editorInstance.selection.getSel();
        var node = sel.baseNode;

        if (node.nodeName === "#text") {
            if (node.parentNode.nodeName === "LI") {
                node = node.parentNode;
            }
        }// else if (node.nodeName === '')

        if (node.nodeName === "LI" && node.previousSibling !== null) { // list item (and not first)
            editorInstance.execCommand('Indent');
        } else { // body item, time for magic
            var prev = node.previousSibling;
            //console.log(sel);
            if (prev !== null && prev.previousSibling !== null && prev.previousSibling.nodeName !== "BR") {
                editorInstance.execCommand('InsertUnorderedList');
            } else if (node.nodeName === '#text' && node.previousSibling.nodeName === 'UL') {
                editorInstance.execCommand('InsertUnorderedList');
            } else if (node.nodeName === 'BODY' && sel.baseOffset > 1) {
                // make sure cursor is below an actual entry (via some DOM parsing magic)
                var offset = 0;
                var i = 0;
                var innerHTML = node.innerHTML;
                while (offset < sel.baseOffset - 2 && i < innerHTML.length) {
                    if (innerHTML.substring(i, i+4) === '<br>') {
                        offset++;
                        i += 4;
                    } else if (innerHTML.substring(i, i+4) === '<ul>') {
                        i += 4;
                        while (innerHTML.substring(i, i+5) !== '</ul>' && i < innerHTML.length) {
                            i++;
                        }
                        offset++;
                    } else {
                        while (innerHTML.substring(i, i+4) !== '<br>' && innerHTML.substring(i, i+4) !== '<ul>' && i < innerHTML.length) {
                            //console.log(innerHTML.substring(i, i+4));
                            i++;
                        }
                        offset++;
                    }
                }

                console.log(sel);
                console.log(['Offset = ' + offset, innerHTML.substring(i, i+4)]);
                if (innerHTML.substring(i, i+4) !== '<br>') {
                    editorInstance.execCommand('InsertUnorderedList');
                }
            } else {

                //console.log(editorInstance.getContent());
                //console.log(editorInstance.selection.getSel());
                // Do nothing.
            }
        }
        //ed.execCommand('Indent');
        //ed.execCommand('InsertUnorderedList');
        //console.log( {html: ed.getContent()} );  REMEMBER TO TURN THIS BACK ON
    };

    var handleOutdent = function(editorInstance) {
        editorInstance.execCommand('Outdent');
    };

    //console.log(editor);
    //tinyMCE.activeEditor.getContent();


    // TODO: Font, Maximize?
    ///*************************************
    // * Toolbar Functionality
    // *************************************/

    // Font, Font Size, Color


    var toolbarHookups = {
        '#bold' : 'bold',
        '#underline' : 'underline',
        '#italic' : 'italic',
        '#strike' : 'strikethrough',
        '#undo' : 'undo',
        '#redo' : 'redo'
        //'#numlist' : 'numlist',
        //'#bullist' : 'Bullist',
        //'#deindent' : 'Outdent'
    };
    $.each(toolbarHookups, function(key, value) {
        $(key).click(function() {
            tinyMCE.activeEditor.execCommand(value);
        });
    });


    //$('#numlist')
    //        ('numberedlist');
    //$('#bullist')
    //        ('bulletedlist');
    //$('#inindent')
    //        ('indent');
    //$('#deindent')
    //        ('outdent');
    //$('#zoomin')
    //        ('maximize');


    //$('#expand').click(attachRandomListener);
    //$('#deindent').click(detachRandomListener);
};

$(document).ready(editorMain);

////var
//
//clearTimeout();
//$('#save-message').html(' - Edited');
//
////stop listening for keystrokes

var attachContentChangedListener = function(callbackFunction) {
    $.each(['paste', 'cut', 'keyup', 'undo', 'redo'], function(index, value) {
        tinyMCE.activeEditor.on(value, callbackFunction);
    });
};
var detachContentChangedListener = function(callbackFunction) {
    $.each(['paste', 'cut', 'keyup', 'undo', 'redo'], function(index, value) {
        tinyMCE.activeEditor.off(value, callbackFunction);
    });
};

var changedListener = function() {
    clearTimeout();
    $('#save-message').html(' - Edited');
    detachChangedListener();
};
var attachChangedListener = function() {
    attachContentChangedListener(changedListener);
};
var detachChangedListener = function() {
    detachContentChangedListener(changedListener);
};

/*************************************
 * Helper functions
 *************************************/

var getEditorHtml = function() {
    /* Returns editor's contents in a parser-friendly format.
     *
     * The loop serves to both get rid of unnecessary line breaks
     * and to move nested <ul> elements to the end of the previous <li>s,
     * as this is proper HTML formatting and the parser's expected format.
     */
    var data = tinyMCE.activeEditor.getContent();
    var i = 0;
    var listLevel = 0;
    var formatted = '';
    while (i < data.length) {
        var c = data.charAt(i);
        if (c === '\n') {
            i++;
        } else if (c === '<') {
            if (i+10 < data.length && data.substring(i, i+11) === '<br />\n<ul>') {
                formatted += '<ul>';
                listLevel++;
                i += 11;
            } else if (i+9 < data.length && data.substring(i, i+10) === '</li>\n<ul>') {
                formatted += '<ul>';
                listLevel++;
                i += 10;
            } else if (i+5 < data.length && data.substring(i, i+5) === '</ul>') {
                formatted += '</ul>';
                if (listLevel > 1) {
                    formatted += '</li>';
                }
                listLevel--;
                i += 5;
            } else {
                formatted += c;
                i++;
            }
        } else {
            formatted += c;
            i++;
        }
    }
    return formatted;
};



var reductiveSplit = function(data, separator) {
    data = data.split(separator);
    //data.filter(function(element) {
    //    element != "";
    //});
    var i = 0;
    while (i < data.length) {
        if (data[i] === "" || data[i] === "&nbsp;" || data[i] === "<br />") {
            data.splice(i, 1);
        } else {
            i++;
        }
    }

    return data;
};

var parseEditorText = function() {
    /* Parses the text inside of the editor
     * after first formatting it appropriately.
     *
     * TODO:
     *    • Parse results from getHTML() rather that getText()
     */
    //var textArray = reductiveSplit(getEditorHtml(), "<br>");
    return parseInput(getEditorHtml());
};




var classString = function(element) {
    if (element.definitions.length > 0) {
        return "identifier-element";
	} else if (element.definitions.length === 0 && element.subelements.length > 0) {
		return "parent-element";
    } else {
        return "unknown-element";
    }
};

var buildList = function(parseResult) {
    /* Takes in a parse result, and rebuilds the
     * #notes-list ordered list with it.
     *
     * TODO:
     *    • Make this not so horribly inefficient
     *    • Figure out how we should separate/format the types of keys
     */
    list = $('#notes-list ol');
    list.empty();

    var representedIdentifiers = [];

    for (i=0; i<parseResult.parsedElements.length; i++) {
        var nextElement = parseResult.parsedElements[i];

		var identifier = nextElement.getIdentifier();
		

        var listItem = '<li class=' + classString(nextElement) + '>' + shorten(identifier) + '</li>';

        if (representedIdentifiers.indexOf(identifier) === -1) {
            list.append(listItem);
            representedIdentifiers.push(identifier);
        }

        if (nextElement.subelements.length > 0) {
            // call recursive function on any subelements
            list.append(buildSublist(nextElement.subelements, 1, representedIdentifiers));
        }
    }
};

function buildSublist(elements, indentLevel, representedIdentifiers) {
    // recursively build sublists within the sidebar to reflect tab organization

    var newList = "<ol>";

    // create string of indents of length == indentLevel
    var indents = "";
    for (var i=0; i<indentLevel; i++) {
        indents += "\t";
    }

    for (i=0; i<elements.length; i++) {
        var nextElement = elements[i];
		
		var identifier = nextElement.getIdentifier();

        if (representedIdentifiers.indexOf(identifier) === -1) {
            newList += indents + "<li class=" + classString(nextElement) + ">" + shorten(identifier) + "</li>";
            representedIdentifiers.push(identifier);
        }

        if (nextElement.subelements.length > 0) {
            // recurse on sublists
            newList += buildSublist(nextElement.subelements, indentLevel+1, representedIdentifiers);
        }

    }
    newList += "</ol>";

    return newList;
}

function shorten(identifier) {
	// ellipsis-truncate an identifier if it exceeds 20 chars
	if (identifier.length > 30) {
		contents = identifier.split(" ");
		identifier = contents[0] + " " + contents[1] + " ... " + contents[contents.length-1];
	}
	return identifier;
}
