/*
Template Name: Ubold - Responsive Bootstrap 5 Admin Dashboard
Author: CoderThemes
Website: https://coderthemes.com/
Contact: support@coderthemes.com
File: Widgets Peity charts init js
*/


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