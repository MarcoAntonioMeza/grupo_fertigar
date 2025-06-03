/*
Template Name: Codefox - Responsive Bootstrap 5 Admin Dashboard
Author: CoderThemes
Website: https://coderthemes.com/   
Contact: support@coderthemes.com
File: Widgets init js
*/
$( document ).ready(function() {
    
    var DrawSparkline = function() {
        // Line Chart
        var colors = ['#00acc1', '#f1556c'];
        var dataColors = $("#lifetime-sales").data('colors');
        if (dataColors) {
            colors = dataColors.split(",");
        }
        $('#lifetime-sales').sparkline([0, 23, 43, 35, 44, 45, 56, 37, 40], {
            type: 'line',
            width: "100%",
            height: '220',
            chartRangeMax: 50,
            lineColor: colors[0],
            fillColor: hexToRGB(colors[0], 0.3),
            highlightLineColor: 'rgba(0,0,0,.1)',
            highlightSpotColor: 'rgba(0,0,0,.2)',
            maxSpotColor: false,
            minSpotColor: false,
            spotColor: false,
            lineWidth: 1
        });

        $('#lifetime-sales').sparkline([25, 23, 26, 24, 25, 32, 30, 24, 19], {
            type: 'line',
            width: "100%",
            height: '220',
            chartRangeMax: 40,
            lineColor: colors[1],
            fillColor: hexToRGB(colors[1], 0.3),
            composite: true,
            highlightLineColor: 'rgba(0,0,0,.1)',
            highlightSpotColor: 'rgba(0,0,0,.2)',
            maxSpotColor: false,
            minSpotColor: false,
            spotColor: false,
            lineWidth: 1
        });

        // Bar Chart
        var colors = ['#00acc1'];
        var dataColors = $("#income-amounts").data('colors');
        if (dataColors) {
            colors = dataColors.split(",");
        }
        $('#income-amounts').sparkline([3, 6, 7, 8, 6, 4, 7, 10, 12, 7, 4, 9, 12, 13, 11, 12], {
            type: 'bar',
            height: '220',
            barWidth: '10',
            barSpacing: '3',
            barColor: colors
        });

        // Pie Chart
        var colors = ['#00acc1','#4b88e4','#e3eaef','#fd7e14'];
        var dataColors = $("#total-users").data('colors');
        if (dataColors) {
            colors = dataColors.split(",");
        }
        $('#total-users').sparkline([20, 40, 30, 10], {
            type: 'pie',
            width: '220',
            height: '220',
            sliceColors: colors
        });
    };
    
    DrawSparkline();
    
    var resizeChart;

    $(window).resize(function(e) {
        clearTimeout(resizeChart);
        resizeChart = setTimeout(function() {
            DrawSparkline();
        }, 300);
    });
});

/* utility function */

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

!function($) {
    "use strict";

    var PeityChart = function() {};

    //create line
    PeityChart.prototype.createLine = function ($element, $strokeColor, $fillColor, $width ,$height) {
        $($element).peity("line", {
            fill: $strokeColor,
            stroke: $fillColor,
            width: $width,
            height: $height
        });
        return $($element);
    },

    //init
    PeityChart.prototype.init = function() {
        //live graph
        var updatingChart = this.createLine(".updating-chart",'#5fbeaa','#5fbeaa', 120,40);

        setInterval(function() {
            var random = Math.round(Math.random() * 10)
            var values = updatingChart.text().split(",")
            values.shift()
            values.push(random)

            updatingChart
                .text(values.join(","))
                .change()
        }, 1000);
    },
    //init
    $.PeityChart = new PeityChart, $.PeityChart.Constructor = PeityChart
}(window.jQuery),

//initializing 
function($) {
    "use strict";
    $.PeityChart.init()
}(window.jQuery);


//peity charts
$('[data-plugin="peity-pie"]').each(function (idx, obj) {
    var colors = $(this).attr('data-colors') ? $(this).attr('data-colors').split(",") : [];
    var width = $(this).attr('data-width') ? $(this).attr('data-width') : 20; //default is 20
    var height = $(this).attr('data-height') ? $(this).attr('data-height') : 20; //default is 20
    $(this).peity("pie", {
        fill: colors,
        width: width,
        height: height
    });
});
//donut
$('[data-plugin="peity-donut"]').each(function (idx, obj) {
    var colors = $(this).attr('data-colors') ? $(this).attr('data-colors').split(",") : [];
    var width = $(this).attr('data-width') ? $(this).attr('data-width') : 20; //default is 20
    var height = $(this).attr('data-height') ? $(this).attr('data-height') : 20; //default is 20
    $(this).peity("donut", {
        fill: colors,
        width: width,
        height: height
    });
});

$('[data-plugin="peity-donut-alt"]').each(function (idx, obj) {
    $(this).peity("donut");
});

// line
$('[data-plugin="peity-line"]').each(function (idx, obj) {
    $(this).peity("line", $(this).data());
});

// bar
$('[data-plugin="peity-bar"]').each(function (idx, obj) {
    var colors = $(this).attr('data-colors') ? $(this).attr('data-colors').split(",") : [];
    var width = $(this).attr('data-width') ? $(this).attr('data-width') : 20; //default is 20
    var height = $(this).attr('data-height') ? $(this).attr('data-height') : 20; //default is 20
    $(this).peity("bar", {
        fill: colors,
        width: width,
        height: height
    });
});

$('[data-plugin="knob"]').each(function (idx, obj) {
    $(this).knob();
});