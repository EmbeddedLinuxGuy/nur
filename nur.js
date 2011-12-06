var GO = {
    square : 50,
    origin : { x : 0, y : 0},
    current : { x : 0, y : 0},
    state : [],
    id : null,
    cursor : "white"
};

GO.puzzle = [
	     '......8.....5.',
	     '..8...........',
	     '.9..........7.',
	     '..5........5..',
	     '..............',
	     '........7.....',
	     '...5..........',
	     '..............',
	     '............6.',
	     '..............',
	     '..............',
	     '............5.',
	     '...........5..',
	     '....7.........',
	     '5.7.......8...',
	     '..............',
	     '..............',
	     '..............',
	     '6..........7..',
	     '..............',
	     '..............',
	     '7........8.8..',
	     '.9............',
	     '..........6.8.'
	   // abcdefghijklmn
	     ];
GO.glog = function (msg) { $('log').innerHTML += '[' + msg + ']'; };

GO.getPuzzle = function (board, puz) {
    //  new Ajax.Request('s.txt',
                new Ajax.Request('/cgi-bin/get-puzzle.cgi?puzzle=' + puz,
		     {
		       method:'get',
		       onSuccess: function(transport){
			   var response = transport.responseText || "no response text";
			   var i;
			   var size = 9;
			   GO.solved = new Array();
			   GO.puzzle = new Array();
			   for (i = 0; i < size; ++i) {
			       GO.solved[i] = transport.responseText.substring(i*size, (i+1)*size);
			       GO.puzzle[i] = GO.solved[i].replace(/#/g, ".");
			       GO.puzzle[i] = GO.puzzle[i].replace(/ /g, ".");
			   }
			   GO.init(board);
		       },
		       onFailure: function(){ alert('Using default puzzle'); GO.init(board); }
		     });
}

GO.tutorial = function () {
    GO.init('tutorial');
}

GO.init = function (id) {
    var x, y, divHTML = '';
    var temp;

    GO.id = id;
    GO.width = GO.puzzle[0].length;
    GO.height = GO.puzzle.length;
    //    GO.glog(GO.width + "x" + GO.height);

    // number of boxes on each side is 1 less than size of puzzle grid

    for (y = 0; y < GO.height-1; ++y) {
	for (x = 0; x < GO.width-1; ++x) {
	    divHTML += '<div class="square"></div>';
	}
	divHTML += '<div class="square nextrow"></div>';
    }
    $(id).innerHTML = divHTML;

    for (y = 0; y < GO.height; ++y) {
	GO.state[y] = new Array();
	for (x = 0; x < GO.width; ++x) {
	    GO.state[y][x] = GO.puzzle[y].substring(x, x+1);
	    GO.add(x, y, GO.state[y][x]);
	}
    }

//    [x, y] = $(id).cumulativeOffset();
    offset = $(id).cumulativeOffset();
    x = offset[0];
    y = offset[1];
    GO.origin = {x : x, y : y};
    //    GO.glog(GO.origin.x + "," + GO.origin.y);
    GO.timeout = new Array();
    $(GO.id).observe('click', GO.respondToClick);
}

// called by: GO.respondToClick, conn.onSubscribed
// calls: GO.change

GO.place = function (x, y) {
    var color = GO.pickColor(x, y);
    GO.change(x, y, color);
    if (GO.isBlack(x+1, y)) {
	GO.change(x+1, y, GO.getBlackStyle(x+1, y));
    } else if (GO.isWhite(x+1, y)) {
	GO.change(x+1, y, GO.getWhiteStyle(x+1, y));
    }
    if (GO.isBlack(x-1, y)) {
	GO.change(x-1, y, GO.getBlackStyle(x-1, y));
    } else if (GO.isWhite(x-1, y)) {
	GO.change(x-1, y, GO.getWhiteStyle(x-1, y));
    }
    GO.change(x, y, color); // in case we got a goblin
}

GO.respondToClick = function (event) {
    GO.current = { x : event.pointerX() - GO.origin.x,
		   y : event.pointerY() - GO.origin.y
    };
    GO.vertex = { x : Math.round(GO.current.x/GO.square),
		  y : Math.round(GO.current.y/GO.square)
    };
    console.log(GO.vertex.x + ", " + GO.vertex.y);
    //    GO.glog(GO.state[GO.vertex.y][GO.vertex.x]);
    //    GO.glog(GO.vertex.x);

    // call publish
    conn.publish('chat', "GO.place(" + GO.vertex.x + "," + GO.vertex.y + ")" )
    //    GO.place(GO.vertex.x, GO.vertex.y);
}

GO.isWhite = function (x, y) {
    return (GO.state[y][x] === 'w'
        	   || (GO.state[y][x] >= '1'
		       && GO.state[y][x] <= '9'));
}

GO.isBlack = function (x, y) {
    return (GO.state[y][x] === 'b');
    //	   || (GO.state[y][x] >= '1'
    //	       && GO.state[y][x] <= '9'));
}

GO.getBlackStyle = function(x, y) {
    var color = 'black';
    if (GO.isBlack(x+1, y) && ! GO.isBlack(x-1, y)) {
	color = 'b6';
    } else if (GO.isBlack(x-1, y) && ! GO.isBlack(x+1, y)) {
	color = 'b4';
    } else if (GO.isBlack(x-1, y) && GO.isBlack(x+1, y)) {
	color = 'b46';
    }
    return color;
}

GO.getWhiteStyle = function(x, y) {
    var color = 'white';
    if (GO.isWhite(x+1, y) && ! GO.isWhite(x-1, y)) {
	color = 'w6';
    } else if (GO.isWhite(x-1, y) && ! GO.isWhite(x+1, y)) {
	color = 'w4';
    } else if (GO.isWhite(x-1, y) && GO.isWhite(x, y)) {
	color = 'w46';
    }
    return color;
}

GO.pickColor = function(x, y) {
    if (GO.state[y][x] === '.') {
	GO.state[y][x] = 'b';
	color = GO.getBlackStyle(x, y);
    } else if (GO.state[y][x] === 'w') {
	GO.state[y][x] = '.';
	color = 'empty';
    } else if (GO.state[y][x] === 'b') {
	GO.state[y][x] = 'w';
	color = GO.getWhiteStyle(x, y);
    } else {
	return; // Don't override initial stones
    }
    return color;
}
	
GO.add = function(x, y, n) {
    var style = 'margin-top : '
    + GO.square * (y - GO.height + 1/2)
    + 'px; margin-left : '
    + GO.square * (x - 1/2)
    + 'px;'
    + 'vertical-align: super; padding-top: -10;'
    ;
    if (n === '.') { color = 'empty'; n = ''; } else { color = 'white'; }
    var stone = new Element('div', {
	    "class" : "stone " + color,
	    "id" : "x" + x + "y" + y,
	    "style" : style
	});
    stone.innerHTML = "<br />" + n;
    $(GO.id).insert(stone);
}

// called by: GO.place

GO.change = function (x, y, color) {
    var oldid = "x" + x + "y" + y;
    var oldnode = $(oldid);
    if (oldnode) {
	oldnode.className = "stone " + color;
	// get rid of goblin if there is one
	if (oldnode.innerHTML) {
	    // but don't get rid of numbered stones
	    var lastchar = oldnode.innerHTML[oldnode.innerHTML.length-1];
	    if (lastchar < '1' || lastchar > '9') {
		oldnode.innerHTML = '';
	    }
	}
	if (GO.timeout[oldid]) {
	    clearTimeout(GO.timeout[oldid]);
	}
	if (color[0] === 'w' && GO.solved[y][x] === '#') {
	    GO.timeout[oldid] = setTimeout("$(\""+oldid+"\").innerHTML = "
					   + "'<img src=\"goblin.png\" />';",
		       3000);
	}
    } else {
	console.log("Error: no node " + oldid);
    }
}

GO.getPuzzle('board', 1);
//GO.init('board');
