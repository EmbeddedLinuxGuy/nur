var GO = {
    square : 50,
    origin : { x : 0, y : 0},
    current : { x : 0, y : 0},
    state : [],
    id : null
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
	    if (GO.state[y][x] !== '.') {
		GO.place(x, y, GO.state[y][x]);
	    }
	}
    }

//    [x, y] = $(id).cumulativeOffset();
    offset = $(id).cumulativeOffset();
    x = offset[0];
    y = offset[1];
    GO.origin = {x : x, y : y};
    //    GO.glog(GO.origin.x + "," + GO.origin.y);
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
    conn.publish('chat', "GO.place(" + GO.vertex.x + "," + GO.vertex.y + ",'')" )
    
    //    GO.place(GO.vertex.x, GO.vertex.y, '')
}

GO.place = function (x, y, n) {
    var color;
    if (n === '') {
	if (GO.state[y][x] === '.') {
	    GO.state[y][x] = 'b';
	    color = 'black';
	} else if (GO.state[y][x] === 'w') {
	    GO.state[y][x] = '.';
	    color = 'empty';
	} else if (GO.state[y][x] === 'b') {
	    GO.state[y][x] = 'w';
	    color = 'white';
	} else {
	    return; // Don't override initial stones
	}
    } else {
	color = 'white';
    }

    $(GO.id).innerHTML +=

    '<div class="stone '
    + color 
    + '" style="'
    + 'margin-top : '
    + GO.square * (y - GO.height + 1/2)
    + 'px; margin-left : '
    + GO.square * (x - 1/2)
    + 'px;'
    + 'vertical-align: super; padding-top: -10;'
    + '">'
    + n
    + '</div>';
}

GO.init('board');
$('board').observe('click', GO.respondToClick);
