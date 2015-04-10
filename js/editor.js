/* Quinote Software Group 2015
 *
 * Author(s): Cameron Basham, Elliott Warkus
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

var editor;

var main = function() {
    editor = CKEDITOR.replace('editor');
    //editor = CKEDITOR.replace('editor', {
    //    removePlugins: 'toolbar, ckeditor-gwf-plugin, resize',
    //    allowedContent: 'strong em u s ul ol; a[!href]; img[!src,width,height];'
    //} );

    //console.log(editor.commands);

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
            editor.execCommand('numberedlist');
        })
    ;
    $('#bullist')
        .click(function() {
            editor.execCommand('bulletedlist');
        })
    ;
    $('#inindent')
        .click(function() {
            editor.execCommand('indent');
        })
    ;
    $('#deindent')
        .click(function() {
            editor.execCommand('outdent');
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
    //
    //// Must use JQuery here to grab actual html object
    //$('#editor')
    //    .click(function() {
    //        editor.focus();
    //    })
    //;

    //$('#fontsize')
    //    .on('change')(function() {
    //        $('.ql-size').add
    //    })

    //$(window).resize(resizeEditor);


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

$(document).ready(main);

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

/*var setEditorHtml = function(html) {
    editor.document.getBody().setHtml(html);
};*/

var container = $('#service-container');
	var filetext = container.data('content');
	//$('#filecontent').html(filetext);
	console.log('text grabbed: '+filetext);
	editor.setData('dooap');

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