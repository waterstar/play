
/**
 * Module dependencies.
 */
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var routes = require('./routes');

//var app = module.exports = express.createServer();
var app = express();

var oracle = ['THE MATRIX ','NEO ', 'FREE YOUR MIND ',' TRINITY ','DEJAVU ', 'KNOCK KNOCK NEO ','THERE IS NO SPOON ' ];
var codes = 'abcdefghijklmnopqrstuvwxyz';
var thematrix = oracle[parseInt(Math.random() * (oracle.length-1))];
//var thematrix = 'OLYMPIC ';
var thematrixcodes = thematrix + codes;
var neomatrix;


// Configuration
  app.set('port', process.env.PORT || 3000);
//app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride());
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'));
//});

var env = process.env.NODE_ENV || 'development';
if (env == 'development')
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
else
  app.use(errorHandler());

// Routes

app.get('/', routes.index);

var server = http.createServer(app);
var io = require('socket.io')(server);
io.set('log level', 0);


io.on('connection', function (socket) {
    var socketid = socket.id;
    var cnt = 100;
    var mcodes;
    var thecode;
    var name;
    var sid = 0;
    var codepos = 0;
    var neo = false;
    var matrix = {code:'', reveal:false};

    console.log(socketid);
    //socket.emit('startmatrix', {code:'the beginning'});
    socket.on('mcodes', function (data) {
        mcodes = data;
				console.log('on mcodes :', mcodes);
				console.log('thematrixcodes :', thematrixcodes);
        setInterval(function(){
            if (neo) {
                if (sid > (mcodes.slots.length-1)) { sid = 0 };
                if (codepos > (neomatrix.length-1)){ codepos = 0;}
                thecode = neomatrix.charAt(codepos++);

                name = mcodes.slots[sid].name;
                matrix.code = thecode;
                matrix.reveal = true;
                socket.emit(name, matrix);

                sid++;

//                /** adding a space at the end of thematrixcodes **/
//                if (codepos == 0 && sid < (mcodes.slots.length-1)) {
//                    sid++;
//                    name = mcodes.slots[sid].name;
//                    matrix.code = ' ';
//                    socket.emit(name, matrix);
//                }
            }
            else {
                sid = parseInt((Math.random() * (mcodes.slots.length-1)));
                thecode = thematrixcodes.charAt(parseInt(Math.random() * (thematrixcodes.length-1)));

                name = mcodes.slots[sid].name;
                matrix.code = thecode;
                socket.emit(name, matrix);
                //socket[socket.id].emit('matrixcode', {code:'m'});
            }

        }, 10);
    });

    socket.on('thematrix', function(data){
        console.log('thematrixcodes : ' + data.codes);
				console.log('thematrix : ' + thematrix);
        data.codes = data.codes + ' ';
        if (data.codes == thematrix){
            neomatrix = thematrix;
            socket.broadcast.emit('thematrixdecoded');
            neo = true;
            sid = 0;
            codepos = 0;
            socket.emit('resetmatrixcanvas');
            thematrix = oracle[parseInt(Math.random() * (oracle.length-1))];
            thematrixcodes = thematrix + codes;
        }
    });

    socket.on('thematrixdecoded', function(){
        console.log('thematrixdecoded ! you lose !');
        neo = true;
        sid = 0;
        codepos = 0;
        socket.emit('resetmatrixcanvas');
    });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//app.listen(3000, function(){
//  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
//});
