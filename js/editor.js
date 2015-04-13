/* Quinote Software Group 2015
 *
 * Author(s): Cameron Basham, Elliott Warkus, Simone Dozier
 *
 *
 *
 * TODO:
 *    - Update parser on paste, undo, redo, general entry
 *
 */

var editor;

var editorMain = function() {
    tinymce.EditorManager.init({
        selector: 'textarea',
        menubar: false,
        statusbar: false,
        //toolbar: false,
        forced_root_block: false,
        setup: function(ed) {
            ed.on('keydown', function(event) {
                //console.log('<br /><ul>blah'.substring(0, 10));
                //console.log("EDITOR_HTML");
                //console.log(getEditorHtml());
                //console.log("SPLIT_HTML");
                var testHtml = getEditorHtml();
                //testHtml = testHtml.replace(/\u200B+/g, "");
                console.log(reductiveSplit(testHtml, "<br />"));
                //console.log(event);
                if (event.keyCode == 9) { // tab pressed
                    if (event.shiftKey) {
                        handleOutdent(ed);
                    } else {
                        handleIndent(ed);
                    }

                    buildList(parseEditorText());
                    event.preventDefault();
                    return false;
                }
                buildList(parseEditorText());
            });
            ed.on('keypress', function(event) {
                //console.log( {html: ed.getContent({format: 'raw'})} );
                //console.log( {html: ed.getContent()} );
            });
        }
    });

    var handleIndent = function(editorInstance) {
        var node = editorInstance.selection.getSel().baseNode;
        console.log("NEW TAB");
        console.log(editorInstance.selection.getSel());
        if (node.nodeName === "#text" && node.parentNode.nodeName === "LI") {
            node = node.parentNode;
        }
        if (node.nodeName === "LI") { // If list item
            if (node.previousSibling === null) { // If first item
                // Do nothing.
                console.log("First item in list")
            } else {
                console.log("Not first item, so Indent");
                editorInstance.execCommand('Indent');
            }
        } else { // body item
            console.log("Not in a list");
            var prev = node.previousSibling;
            if (prev !== null && prev.previousSibling !== null && prev.previousSibling.nodeName !== "BR") {
                console.log(node.nodeName);
                console.log(prev.nodeName);
                editorInstance.execCommand('InsertUnorderedList');
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
    }

    //console.log(editor);
    //tinyMCE.activeEditor.getContent();


    // TODO: Font, Maximize?
    ///*************************************
    // * Toolbar Functionality
    // *************************************/
    //console.log(editor.commands);
    //console.log(editor.config.plugins);
    //$('#bold')
    //    .click(function() {
    //        editor.execCommand('bold');
    //    })
    //;
    //$('#underline')
    //    .click(function() {
    //        editor.execCommand('underline');
    //    })
    //;
    //$('#italic')
    //    .click(function() {
    //        editor.execCommand('italic');
    //    })
    //;
    //$('#strike')
    //    .click(function() {
    //        editor.execCommand('strike');
    //    })
    //;
    //$('#numlist')
    //    .click(function() {
    //        if (editorFocusManager.hasFocus) {
    //            editor.execCommand('numberedlist');
    //            editorFocusManager.focus();
    //        }
    //    })
    //;
    //$('#bullist')
    //    .click(function() {
    //        if (editorFocusManager.hasFocus) {
    //            editor.execCommand('bulletedlist');
    //            editorFocusManager.focus();
    //        }
    //    })
    //;
    //$('#inindent')
    //    .click(function() {
    //        if (editorFocusManager.hasFocus) {
    //            editor.execCommand('indent');
    //            editorFocusManager.focus();
    //        }
    //    })
    //;
    //$('#deindent')
    //    .click(function() {
    //        if (editorFocusManager.hasFocus) {
    //            editor.execCommand('outdent');
    //            editorFocusManager.focus();
    //        }
    //    })
    //;
    //$('#zoomin')
    //    .click(function() {
    //        editor.execCommand('maximize');
    //    })
    //;



    //
    ///*************************************
    // * Event Handlers
    // *************************************/
    //editor
    //    .on('change', function() {
    //        buildList(parseEditorText());
    //    })
    //;


    // Set up initial environment
    //resizeEditor();
    //editor.focus();
    //$.each([8, 10, 12, 14, 16, 18, 24, 30, 36, 48, 72, 96], function(index, value) {
    //    var fSize = $('.ql-size');
    //    fSize.append($('<option value=' + this.value + '>' + value + '</option>'));
    //            //.val(value + "px")
    //            //.label(value));
    //});
    //fSize.val('12px').prop('selected', true);
    //fSize.change();

};

$(document).ready(editorMain);

/*************************************
 * Helper functions
 *************************************/

var getEditorHtml = function() {
    /* Returns the Html from the editor.
     */
    var data = tinyMCE.activeEditor.getContent();
    var i = 0;
    while (i < data.length) {
        var c = data.charAt(i);
        if (c === '\n') {
            data = data.slice(0, i) + data.slice(i+1);
        } else if (c === '<' && data.length >= i+10 && data.substring(i, i+11) === '<br />\n<ul>') {
            //console.log(data.substring(i, i+10));
            data = data.slice(0, i) + data.slice(i+7);
        } else {
            i++;
        }
    }
    //i = data.indexOf('<br />')
    //console.log(data);
    return data;
};
//
//var setEditorHtml = function(html) {
//    editor.document.getBody().setHtml(html);
//};

//console.log(editor);


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
    if (element instanceof DateElement) {
        return "date-element";
    } else if (element.definitions.length > 0) {
        return "identifier-element";
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



        var listItem = '<li class=' + classString(nextElement) + '>' + nextElement.getIdentifier() + '</li>';

        if (representedIdentifiers.indexOf(nextElement.getIdentifier()) === -1) {
            list.append(listItem);
            representedIdentifiers.push(nextElement.getIdentifier());
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

        if (representedIdentifiers.indexOf(nextElement.getIdentifier()) === -1) {
            newList += indents + "<li class=" + classString(nextElement) + ">" + nextElement.getIdentifier() + "</li>";
            representedIdentifiers.push(nextElement.getIdentifier());
        }

        if (nextElement.subelements.length > 0) {
            // recurse on sublists
            newList += buildSublist(nextElement.subelements, indentLevel+1, representedIdentifiers);
        }

    }
    newList += "</ol>";

    return newList;
}
