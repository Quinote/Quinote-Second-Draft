/* Quinote Software Group 2015
 *
 * Author(s): Cameron Basham, Elliott Warkus, Simone Dozier
 *
 *
 *
 * TODO:
 *    • Find meaningful way to handle user's text formatting
 *    • Take more efficient approach to rebuilding list on text input
 *    • Build more logical and aesthetically pleasing list
 *    • Adapt handlers for new UI (and subsequently uncomment them)
 *    • Get font stuff working
 *      – Use selected font from get-go
 *      – Keep it on "enter" input
 *
 */

var editor, editorFocusManager;

var editorMain = function() {
    //editor = CKEDITOR.replace('editor');

    //editor = CKEDITOR.replace('editor_div', {
    //    removePlugins: 'toolbar, ckeditor-gwf-plugin, resize',

    editor = CKEDITOR.replace('editor_div', {
        removePlugins: 'ckeditor-gwf-plugin, resize, tab',
        allowedContent: 'strong em u s ul ol li; a[!href]; img[!src,width,height];'
    } );
    editorFocusManager = new CKEDITOR.focusManager( editor );


    // TODO: Conditional list/indent, cancel other events, handle ranges (instead of just carets)
    ///*************************************
    // * Tab Key Handling
    // *************************************/

    //$('#editorspace').on('keydown', function(e) {
    //    var keyCode = e.keyCode || e.which;
    //    console.log(e);
    //    if (keyCode === 2228233) {
    //        e.preventDefault();
    //        editor.execCommand('outdent');
    //    } else if (keyCode === 9) {
    //        e.preventDefault();
    //        editor.execCommand('bulletedlist');
    //    }
    //});

    //editor.addCommand( 'handleTab', new CKEDITOR.command(editor, function() {
    //        editor.execCommand('bulletedlist');
    //    })
    //);
    //editor.setKeystroke( 9, 'handleTab' );

    //editor.on( 'key', function( evt ) {
    //    if (evt.data.keyCode === 2228233 /* SHIFT+TAB */) {
    //        evt.cancel();
    //        editor.execCommand('outdent');
    //    } else if (evt.data.keyCode === 9 /* TAB */) {
    //        evt.cancel();
    //        editor.execCommand('bulletedlist');
    //    }
    //    //console.log(evt);
    //});

    editor.on('key', function(e) {
        var key = e.data.keyCode;
        //console.log(key);
        if (key === 9 /* TAB */) {
            var r = editor.getSelection()._.cache.nativeSel;
            console.log(r);
            if (r.type === "Caret") {
                console.log( {html: getEditorHtml() } );
                if (r.extentNode.parentElement.nodeName === "LI") {
                    //$('#inindent').click();
                } else {
                    //$('#bullist').click();
                }
            } else if (r.type === "Range") {
                if (r.extentNode === r.baseNode) {
                    //console.log("SAME LINE");
                } else {

                }
            } else {
                console.log("Type '" + r.type + "' not handled.");
            }

            //.getRanges()[0]);
            //var r = editor.getSelection().getRanges()[0];
            //if (r.startContainer.$ == r.endContainer.$) {
            //    console.log("Same!");
            //} else {
            //    console.log("Diff!");
            //}
            //editor.execCommand('bulletedlist');
            return false;
        } else if (key === 2228233 /* SHIFT+TAB */) {
            editor.execCommand('outdent');
            return false;
        }
    });


    // TODO: Font, Maximize?
    ///*************************************
    // * Toolbar Functionality
    // *************************************/
    //console.log(editor.commands);
    //console.log(editor.config.plugins);
    $('#bold')
        .click(function() {
            editor.execCommand('bold');
        })
    ;
    $('#underline')
        .click(function() {
            editor.execCommand('underline');
        })
    ;
    $('#italic')
        .click(function() {
            editor.execCommand('italic');
        })
    ;
    $('#strike')
        .click(function() {
            editor.execCommand('strike');
        })
    ;
    $('#numlist')
        .click(function() {
            if (editorFocusManager.hasFocus) {
                editor.execCommand('numberedlist');
                editorFocusManager.focus();
            }
        })
    ;
    $('#bullist')
        .click(function() {
            if (editorFocusManager.hasFocus) {
                editor.execCommand('bulletedlist');
                editorFocusManager.focus();
            }
        })
    ;
    $('#inindent')
        .click(function() {
            if (editorFocusManager.hasFocus) {
                editor.execCommand('indent');
                editorFocusManager.focus();
            }
        })
    ;
    $('#deindent')
        .click(function() {
            if (editorFocusManager.hasFocus) {
                editor.execCommand('outdent');
                editorFocusManager.focus();
            }
        })
    ;
    //$('#zoomin')
    //    .click(function() {
    //        editor.execCommand('maximize');
    //    })
    //;



    //
    ///*************************************
    // * Event Handlers
    // *************************************/
    editor
        .on('change', function() {
            buildList(parseEditorText());
        })
    ;


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
    var data = editor.document.getBody().getHtml();
    //console.log(data);
    return data;
};

var setEditorHtml = function(html) {
    editor.document.getBody().setHtml(html);
};

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
            i--;
        }
        i++;
    }
    return data;
};

var resizeEditor = function() {
    /* Resizes the editor box based on window height,
     * top margin size, and toolbar height.
     *
     */
    var spaceLeft = $(window).height()
        - ($('.editor-wrapper').height() - $('#editor').height())
        - (2 * parseInt($('#container-fluid').css('margin-top')))
        - 2;
    $('#editor').height(spaceLeft);
    console.log($('#editor').height());
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

    for (i=0; i<parseResult.parsedElements.length; i++) {
        var nextElement = parseResult.parsedElements[i];

        var listItem = '<li class=' + classString(nextElement) + '>' + nextElement.getIdentifier() + '</li>';
        //listItem.addClass(classString(nextElement));
        list.append(listItem);

        if (nextElement.subelements.length > 0) {
            // call recursive function on any subelements
            list.append(buildSublist(nextElement.subelements, 1));
        }
    }
};

function buildSublist(elements, indentLevel) {
    // recursively build sublists within the sidebar to reflect tab organization

    var newList = "<ol>";

    // create string of indents of length == indentLevel
    var indents = "";
    for (var i=0; i<indentLevel; i++) {
        indents += "\t";
    }

    for (i=0; i<elements.length; i++) {
        var nextElement = elements[i];
        newList += indents + "<li class=" + classString(nextElement) + ">" + nextElement.getIdentifier() + "</li>";
        if (nextElement.subelements.length > 0) {
            // recurse on sublists
            newList += buildSublist(nextElement.subelements, indentLevel+1);
        }
    }
    newList += "</ol>";

    return newList;
}
