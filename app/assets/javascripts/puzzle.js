var mouseDown = false;
var currentTool = 'none';
var currentNum  = 'none';

var Puzzle = {
    
    currentPuzzle: {},
    
    setBoard: function(){
        var layout = this.currentPuzzle.board.split("");
        for(var i = 0; i < 81; i++){
            var value = layout[i];
            var square = $("#square-" + i);
            if(value == "0"){
                setSquareText( square, "");
            } else {
                setSquareText( square, value);
                square.addClass('permanent');
            }
        }
    },
    
    currentBoard: function() {
        var board = [];
        var valid = "123456789";
        for(var i = 0; i < 81; i++) {
            var text = getSquareText( $("#square-" + i) );
            board[i] = text;
        }
        for(var i = 0; i < board.length; i++) {
            if (board[i].length != 1 || valid.indexOf(board[i]) == -1){
                board[i] = "0";
            }
        }
        return board.join("");
    },
    
    fetchPuzzle: function(id) {
        $.ajax({
            type: "GET",
            url: "/puzzles/" + id,
            dataType: "json",
            success: function(data){
                Puzzle.currentPuzzle = data; 
                Puzzle.setBoard();
            }        
        });
    }
};

// handlers (clicks, mouseovers etc)
var handleSquareMouseEnter = function ($square) {
    if ( mouseDown && textContains(currentTool, "highlighter")){
        highlight($square);
    } else
    if ( mouseDown && currentTool == "eraser") {
        erase($square, "onlyHighlight");
    }
};

var handleSquareClick = function($square) {
    if (currentTool.indexOf("highlighter") != -1) {
        highlight($square);
    } else
    if (currentTool == "eraser") {
        erase($square);
    } else
    if (currentTool == "pen") {
        writePen($square);
    } else
    if (currentTool == "pencil") {
        writePencil($square);
    }
};

var handleToolClick = function($tool) {
    $('.image-container').removeClass('active');
    $tool.find('.image-container').addClass('active');
    currentTool = $tool.attr('id');
};

var handleNumberClick = function($num) {
    $('.num-select').removeClass('active');
    $num.addClass('active');
    currentNum = $num.attr('id').replace("num-select-","");
};


// tool actions
function highlight($square) {
    var color = currentTool.replace("-highlighter","");
    var classes = "highlighted highlighted-".concat(color);
    $square.addClass(classes);
}

function erase($square, option){
    if ( isHighlighted($square) ) {
        $square.removeClass("highlighted highlighted-red highlighted-blue");
    } else
    if (option == "onlyHighlight") { return; } else
    if (isChangeable($square)) {
        clearTooledClasses($square);
        setSquareText($square, "");
    }
}

function writePen($square) {
    if (isChangeable($square) && numSelected()) {
        $square.addClass("penned");
        setSquareText($square, currentNum);
    }
}

function writePencil ($square) {
    if (numSelected() && !(isInPen($square) || isPermanent($square)) ) {
        $square.addClass("penciled");
        var text = getSquareText($square);
        var num = currentNum.concat(" ");
        if (textContains(text, num)){
            text = text.replace(num, "");
        } else {
            text = text.concat(num);
        }
        setSquareText($square, text);
    }
}

// Puzzle helper functions for clearer logic.
function isPermanent($square) {
    return $square.hasClass("permanent");
}

function isChangeable($square) {
    return !isPermanent($square);
}

function isInPen($square) {
    return $square.hasClass("penned");
}

function isInPencil($square) {
    return $square.hasClass("penciled");
}

function isHighlighted($square) {
    return $square.hasClass("highlighted");
}

function numSelected() {
    return currentNum !== "none";
}

function textContains(string1, string2) {
    return string1.indexOf(string2) >= 0;
}


function getSquareText($square) {
    return $square.find('.square-text').text();
}
function setSquareText($square, textToSet) {
    $square.find('.square-text').text(textToSet);
    Resizer.resize();
}

function clearTooledClasses($square) {
    $square.removeClass('penned');
    $square.removeClass('penciled');
}

function setMouseUp(){
    mouseDown = false;
}

function setMouseDown(){
    mouseDown = true;
}

// The event bindings for the puzzle, clicking, dragging and so forth...
Binder.addBinding(document, 'mousedown', setMouseDown);
Binder.addBinding(document, 'mouseup', setMouseUp);
Binder.addBinding('.square', 'mouseenter', handleSquareMouseEnter);
Binder.addBinding('.square', 'mousedown', handleSquareClick);
Binder.addBinding('.tool', 'mousedown', handleToolClick);
Binder.addBinding('.num-select', 'mousedown', handleNumberClick);
