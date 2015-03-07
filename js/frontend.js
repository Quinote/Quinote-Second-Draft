// A model for quiz code

//**************************************
// GLOBAL VARIABLES
//**************************************

var parseResult;
var optionList;
var quiz;
var totalQuestions;
var numberCorrect;
var currentQuestion;
var choices;
var selectTF = ["true", "false"];
var flag = true;

//**************************************
// HANDLERS
//**************************************

$(document).ready(function() {
	$('#buttonGenerateQuiz').click(function() { // GENERATE QUIZ
		
		parseResult = parseInput(editor.getText().split("\n"));
		if (parseResult.dates.length < 4 && parseResult.identifiers.length < 4) {
			alert("You need more notes to make a quiz!");
			$("#quizDialog").removeClass("dialogVisible");
			return;
		}
		
		
		
		optionList = new OptionList(2,2,2);
		quiz = makeQuiz(parseResult, optionList);
		console.log(parseResult, quiz);
		totalQuestions = quiz.size();
		numberCorrect = 0;
		
		$('#quizframe').toggle();
		$('#scorepage').toggle();
		$('#quizDialog').css("z-index", "4");
		//showQuiz();
	});
	
	$('#buttonCloseQuiz').click(function(){
		$('#quizDialog').css("z-index", "-10");
	});

	$('#buttonStartQuiz').click(function(){
		$('#quizframe').toggle();

		nextQuestion();
		flag = false;
	});
	
	
	$("#buttonNext").click(function() { // NEXT button
		nextHandler();
		
	});

	$("#buttonCheck").click(function() { // CHECK answer button

	});
});

//**************************************
// FUNCTIONS
//**************************************

function checkAnswer() {
	
	document.getElementById("checkCon").style.visibility="visible";
	document.getElementById("answerSelections").style.visibility="hidden";
	
	
	if (currentQuestion instanceof MultipleChoiceQuestion) {
		checkMCQuestion();
	} else if (currentQuestion instanceof TrueFalseQuestion) {
		checkTFQuestion();
	} else if (currentQuestion instanceof FillInTheBlankQuestion) {
		checkFITBQuestion();
	}
	flag = true;
}

function checkMCQuestion() {
	var inputs = $("[name='rd']");
	var index = -1;
	for (i=0; i<inputs.length; i++) {
		if (inputs[i].checked) {
			index = i;
		}
	}
	if (index === -1) {
        document.getElementById("answerSelections").style.visibility="visible";
		alert("Please select an answer");
		console.log("No answers selected", ($('input[name="rd"]:checked').length > 0));
	} else {
		var selected = choices[index];
		console.log(selected);
		if (selected === currentQuestion.answer) {
			showCorrect();
			numberCorrect++;
		} else {
			showIncorrect();
		}
		inputs[index].checked = false;
		checkPage();
	}
}

function checkTFQuestion() {
	var inputs = $("[name='ch']");
	var index = -1;
	for (i=0; i<inputs.length; i++) {
		if (inputs[i].checked) {
			index = i;
		}
	}
	if (index === -1) {
        document.getElementById("answerSelections").style.visibility="visible";
		alert("Please select an answer");
		console.log("No answers selected", ($('input[name="rd"]:checked').length > 0));
	} else {
		var selected = selectTF[index];
		if (selected === currentQuestion.answer) {
			showCorrect();
			numberCorrect++;
		} else {
			showIncorrect();
		}
		inputs[index].checked = false;
		checkPage();
	}
}

function checkFITBQuestion() {
	var answerField = $("#ansText");
	var input = $("#ansText").val();
	if (input === "") {
        document.getElementById("answerSelections").style.visibility="visible";
		alert("Please enter an answer.");
	} else {
		if (input === currentQuestion.answer) {
			showCorrect();
			numberCorrect++;
		} else {
			showIncorrect();
		}
		answerField.val("");
		checkPage();
	}
}
		

function nextHandler() {
	// decide what to do upon pressing the 'next' button
	if (quiz.hasNext()) {
		if (flag) {
			nextQuestion();
			flag = false;
		} 
	} else {
		tearDown(); //?
	}
}

function nextQuestion() {
	
	document.getElementById("answerSelections").style.visibility="";
	document.getElementById("buttonCheck").style.display="";
	document.getElementById("buttonNext").style.display="none";
	hideIncorrect();
	hideCorrect();
	
	//global?
	currentQuestion = quiz.getNext();
	if (currentQuestion instanceof MultipleChoiceQuestion) {
		initializeMCQuestion(currentQuestion);
	} else if (currentQuestion instanceof TrueFalseQuestion) {
		initializeTFQuestion(currentQuestion);
	} else if (currentQuestion instanceof FillInTheBlankQuestion) {
		initializeFITBQuestion(currentQuestion);
	} else {
		console.log("Error: Question type unrecognized.");
	}
}
	

function initializeMCQuestion(question) {
	choices = currentQuestion.getAllAnswers();
	var questionTag = $("#question");
	$(questionTag).html(question.getText());
	hideText();
	showRadioChoice();
	showRadiobuttons(question);
	hideCheck();
	
	// not sure what this does?
	$("#answer_choice").insertAfter("#formAction");
}

function initializeTFQuestion(question) {
	var questionTag = $("#question");
	$(questionTag).html(question.getText());
	hideChoice();
	hideText();
	showCheckbuttons();
	showCheck();
	
	$("#answer_check").insertAfter("#formAction");
}

function initializeFITBQuestion(question) {
	var questionTag = $("#question");
	$(questionTag).html(question.getText());
	hideChoice();
	showText();
	hideCheck();
	$("#answer_text").insertAfter("#formAction");
}
	

function endQuiz(numberCorrect) {
	// finish the quiz, present the percentage correct, etc.
}

function tearDown() {
	// hide DOM elements, do necessary cleanup
	completeQuiz();
}


///// COPIED FUNCTIONS /////

function showQuiz(){
	document.getElementById("quizopener").style.display="none";
	document.getElementById("quizframe").style.visibility="visible";
	document.getElementById("scorepage").style.display="none";
	document.getElementById("svgOpener").style.display="none";
	document.getElementById("scoreKeeper").style.display="none";
	document.getElementById("one").style.display="none";
	document.getElementById("two").style.display="none";
};

function unshowQuiz() { 
	//$("#quizopener").style.display="none";
	$("#quizframe").style.visibility="hidden";
	//$("#scorepage").style.display="none";
	//$("#svgOpener").style.display="none";
	//$("#scoreKeeper").style.display="none";
	//$("#one").style.display="none";
	//$("#two").style.display="none";
}

function checkPage(){
	document.getElementById("buttonCheck").style.display="none";
	document.getElementById("buttonNext").style.display="";
}
function showCheck(){
	document.getElementById("answer_check").style.display="";
}
function hideCheck(){
	document.getElementById("answer_check").style.display="none";
}
function showText(){
	document.getElementById("answer_text").style.display="";
}
function hideText(){
	document.getElementById("answer_text").style.display="none";
}
function showRadiobuttons(question){
	//var choices = question.getAllAnswers();
	
	document.getElementById("rad1").innerHTML = choices[0];
	document.getElementById("rad2").innerHTML = choices[1];
	document.getElementById("rad3").innerHTML = choices[2];
	document.getElementById("rad4").innerHTML = choices[3];
	document.getElementById("rad1").value = choices[0];
	document.getElementById("rad2").value = choices[1];
	document.getElementById("rad3").value = choices[2];
	document.getElementById("rad4").value = choices[3];
}
function showCheckbuttons(){
	document.getElementById("true").innerHTML = selectTF[0];
	document.getElementById("false").innerHT = selectTF[1];
	document.getElementById("true").value = selectTF[0];
	document.getElementById("false").value = selectTF[1];
	return;
}
function showRadioChoice(){
	document.getElementById("answer_choice").style.display="";
}
function hideChoice(){
	document.getElementById("answer_choice").style.display="none";
}
function hideCorrect(){
	document.getElementById("one").style.display="none";
}
function hideIncorrect(){
	document.getElementById("two").style.display="none";
}
function showCorrect(){
	document.getElementById("one").style.display="";
	$('#one').toggle;
	var oneAns=document.getElementById("one");
	var aText=" is correct!";
	oneAns.innerHTML= currentQuestion.answer + aText;
	document.getElementById("buttonNext").style.display="";
}
function showIncorrect(){
	document.getElementById("two").style.display="";
	$('#two').toggle;
	var twoAns=document.getElementById("two");
	var a2Text="Incorrect! The answer is: ";
	twoAns.innerHTML= a2Text + currentQuestion.answer;
	document.getElementById("buttonNext").style.display="";	
}

function uninitQuizFrame() {
	var overlay = document.querySelector( '.dialogShadow' );
	[].slice.call( document.querySelectorAll( '.dialogTrigger' ) ).forEach( function( el, i ) {
		var transform = document.querySelector( '#quizDialog' ),
		close = transform.querySelector( '.dialogClose' );
		function removeDialog() {
			$("#quizDialog").removeClass("dialogVisible");
		}
		function removeDialogHandler() {
			removeDialog();
		}
		el.addEventListener( 'click', function( ev ) {
			$("#quizDialog").addClass("dialogVisible");
		});
		close.addEventListener( 'click', function( ev ) {
			removeDialogHandler();
		});
	});
}

var dialog = (function() {
	function init() {
		var overlay = document.querySelector( '.dialogShadow' );
		[].slice.call( document.querySelectorAll( '.dialogTrigger' ) ).forEach( function( el, i ) {
			var transform = document.querySelector( '#quizDialog' ),
			close = transform.querySelector( '.dialogClose' );
			function removedialog() {
				$("#quizDialog").removeClass("dialogVisible");
			}
			function removedialogHandler() {
				removedialog();
			}
			el.addEventListener( 'click', function( ev ) {
				$("#quizDialog").addClass("dialogVisible");
			});
			close.addEventListener( 'click', function( ev ) {
				removedialogHandler();
			});
		});
	}
	init();
})();

function randomizeQuiz(){};

function completeQuiz(){
	var score_exit;
	document.getElementById("scr").value = score_exit;
	var om = document.getElementById("qLength").value;
	var tot = (parseInt(om));
	$("#question").html("<h4>Your score is: "+numberCorrect+"/"+totalQuestions+"<h4>");
	$("#scoreDisplay").html("" +numberCorrect+"/"+totalQuestions+ "");
	document.getElementById("answer_text").style.display="none";
	document.getElementById("answer_choice").style.display="none";
	document.getElementById("answer_check").style.display="none";
	document.getElementById("scorepage").style.display="";
	document.getElementById("buttonNext").style.display="none";
	document.getElementById("question").style.display="none";
	document.getElementById("buttonCheck").style.display="none";
	document.getElementById("quizframe").style.display="none";
	document.getElementById("quizopener").style.display="none";
};


$(function(){
	$("#editorspace").draggable({
		handle: "#editorToolbar",
		containment: "parent"
	});
	$("#sidebar").draggable({ containment: "parent" });
});
