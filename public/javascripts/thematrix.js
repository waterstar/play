/**
 * Created with JetBrains WebStorm.
 * User: sglai
 * Date: 2/9/12
 * Time: 5:34 PM
 * To change this template use File | Settings | File Templates.
 */

/** global variables for debug purpose **/
var canvas;
var ctx, ctx1;
var mcodes = [];
var codesize = {x:24, y:32};

var socket = io.connect('http://localhost:3000');

function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

socket.on('resetmatrixcanvas', function(){
    //setTimeout(function(){
    ctx.clearRect(0,0,800,600);
    //}, 10);
});

socket.on('thematrixdecoded', function(){
    socket.emit('thematrixdecoded');
});

var MCode = function(name, color){

    var length = parseInt((Math.random() * 9) + 1);
    var start_pos = {x: this.pos.x, y:0};
    var head_pos = {x:start_pos.x, y:0};
    var tail_pos = {x:head_pos.x, y: (head_pos.y - (length * codesize.y))};

    socket.on(name, function(matrix){
        ctx.font      = '32px MatrixCode';
        ctx.fillStyle = color;
        ctx.fillText(matrix.code, head_pos.x, head_pos.y);
        tail_pos = {x:head_pos.x, y: (head_pos.y - (length * codesize.y))};
        if (matrix.reveal == false) {
            /** handle tail **/
            ctx.fillStyle = '#000000';
            ctx.fillRect(tail_pos.x, tail_pos.y, codesize.x, (codesize.y+3));
            if (tail_pos.y >= 600) {
                head_pos.y = (-codesize.y);
                tail_pos.y = 0;
                length = parseInt((Math.random() * 9) + 1);
            }
        }
        else {
            //ctx.clearRect(0, 0, 800, 600);
            if (length != 20) {
                head_pos.y = (-codesize.y);
                tail_pos.y = 0;
                length = 20;
            }
        }
        head_pos.y += codesize.y;
    });

    this.pos.x += codesize.x;

    return { name : name};
};

MCode.prototype.pos = {x:0, y:0};

$(document).ready(function(){

    /** force font to load before writing to canvas **/
    $('body').append("<div id='loadfont' style='font-family: MatrixCode;'>.</div>");

    canvas = $("canvas");
    ctx = canvas[0].getContext("2d");

    for ( var i=0; i < (parseInt(canvas[0].width /codesize.x) + 1); i++) {
        var name = 'm' + i;
        mcodes.push(new MCode(name, get_random_color()));
    }
    socket.emit('mcodes', { slots: mcodes });

    $('input').click(function() {
        this.value = '';
    });

    $('input').keyup(function(e) {
        if (e.keyCode == 13) {
            socket.emit('thematrix', { codes: this.value});
        }
    });

    // remove it after custom font is loaded
    //$('#loadfont').remove();
    //requestAnimationFrame(redraw);
    //setTimeout( function() {
    //    requestAnimationFrame(redraw);
    //}, 1000 / 1 );
});

