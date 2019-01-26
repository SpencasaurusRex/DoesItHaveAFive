$(function(){
    loadTemperatures();
    // Load new temperatures every minute
    setInterval(loadTemperatures, 60*1000);
});

function loadTemperatures() {
    $.post("temps", function(data, status) {
        // Clear existing data
        $('#temps').empty();
        $('#answer').text('');

        // Load new data
        let answer = 'No';
        for (let tempName in data) {
            let attr = '';
            if (data[tempName].includes('5')) {
                answer = 'Yes';
                attr = ' class="valid"';
            }
            $('#temps').append('<tr' + attr + '>'
            + '<td class="right">' + tempName + '</td>'
            + '<td class="left">' + data[tempName] + '</td>'
            + '</tr>');
        }
        $('#answer').append(answer);
    });
}