var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', (eventbody) => {
                console.log("Event: ", eventbody);
                alert(eventbody.body);
                let point = JSON.parse(eventbody.body);
                console.log(point)
                
            });
        });

    };
    
    

return {

          init: function () {
                    var can = document.getElementById("canvas");
                    console.log("connect");
                    //websocket connection
                    connectAndSubscribe();
          },

          publishPoint: function(){
                    let x = document.getElementById("x").value;
                    let y = document.getElementById("y").value;

                    var pt=new Point(x,y);
                    console.info("publishing point at ("+ pt.x + ", " + pt.y + ")");
                    addPointToCanvas(pt);

                    //publicar el evento
                    stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
          },

          disconnect: function () {
                    if (stompClient !== null) {
                    stompClient.disconnect();
                    }
                    setConnected(false);
                    console.log("Disconnected");
          }         
    };

})();