var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    let connection = null;
    
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

    let mouseEventListner = function () {
          let elements = [];
          let canvas = document.getElementById("canvas");
          elemLeft = canvas.offsetLeft + canvas.clientLeft,
          elemTop = canvas.offsetTop + canvas.clientTop,
          canvas.addEventListener('click', function(event) {
                    var x = event.pageX - elemLeft,
                        y = event.pageY - elemTop;
                
                    // Collision detection between clicked offset and element.
                    elements.forEach(function(element) {
                              if (y > element.top && y < element.top + element.height 
                                        && x > element.left && x < element.left + element.width) {
                                        alert('clicked an element');
                              }
                    });
                    var pt=new Point(x,y);
                    stompClient.send(`/topic/newpoint.${connection}`, {}, JSON.stringify(pt)); ;
          });
    };

    var connectAndSubscribe = function (draw) {
          connection = draw;
          console.info('Connecting to WS...');
          var socket = new SockJS('/stompendpoint');
          stompClient = Stomp.over(socket);
          
          //subscribe to /topic/TOPICXX when connections succeed
          stompClient.connect({}, function (frame) {
                    console.log('Connected: ' + frame);
                    stompClient.subscribe(`/topic/newpoint.${connection}`, (eventbody) => {
                              let point = JSON.parse(eventbody.body);
                              console.log(point)
                              var pt=new Point(point.x, point.y);
                              addPointToCanvas(pt);
                    });
          });

    };
    
    

return {

          init: function () {
                    var can = document.getElementById("canvas");
                    console.log("connect");
                    //websocket connection
                    mouseEventListner();
          },

          subscribe: function () {
                    let draw = document.getElementById("draw").value;
                    connectAndSubscribe(draw);
          },

          publishPoint: function (){
                    let x = document.getElementById("x").value;
                    let y = document.getElementById("y").value;

                    var pt=new Point(x,y);
                    console.info("publishing point at ("+ pt.x + ", " + pt.y + ")");

                    //publicar el evento
                    stompClient.send(`/topic/newpoint.${connection}`, {}, JSON.stringify(pt)); 
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