$(function(){
    loadTemperatures();
    // Load new temperatures every minute
    setInterval(loadTemperatures, 60*1000);
});

function loadTemperatures() {
    $.post("temps", function(data, status) {
        
    });
}