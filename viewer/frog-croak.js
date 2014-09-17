/*
 *  Frog Croak - Internet speed test log viewer and collector
 *
 *  Copyright (C) 2014 Carlos Jenkins <carlos@jenkins.co.cr>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

function analyse_range(start, end) {

}

// Dygraph callback that Paints an horizontal line at given threshold
function threshold_painter(thr) {
    return function(canvas, area, g) {

        // Define points
        var range = g.xAxisRange();
        var p1 = g.toDomCoords(range[0], thr);
        var p2 = g.toDomCoords(range[1], thr);

        // Draw line
        canvas.strokeStyle = 'red';
        canvas.lineWidth = 1.0;
        canvas.beginPath();
        canvas.moveTo(p1[0], p1[1]);
        canvas.lineTo(p2[0], p2[1]);
        canvas.closePath();
        canvas.stroke();
        canvas.restore();
    };
}


// Parse an ISO 8601 date using moment.js for cross-browser consistent results
function parse_date(string) {
    return moment(string).valueOf();
}


// Pretty-print the speed value
function format_speed(speed) {
    return speed + ' Mbps';
}


// Create and configure graphs
function config_graphs(t, config) {

    // Create DOWNLOAD graph
    var g_download = new Dygraph(

        // Containing div
        document.getElementById('graph_download'),

        // CSV file
        config.data,

        // Options
        {
            labels: [
                t('date'),
                t('download'),
                t('upload')
            ],
            ylabel: t('speed_mbps'),
            visibility: [true, false],
            animatedZooms: true,
            xValueParser: parse_date,
            axes: {
                y: {
                    valueFormatter: format_speed,
                },
            },
            underlayCallback: threshold_painter(config.download_guaranteed)
        }
    );

    g_download.ready(function() {
        g_download.updateOptions({
            zoomCallback: function(xmin, xmax, yranges) {
                alert("Zoomed to [" + xmin + ", " + xmax + "]");
                for (var i = 0; i < g_download.numRows(); i++) {
                    console.log(g_download.getValue(i, 0));
                }
            }
        });
    });

    // Create UPLOAD graph
    var g_upload = new Dygraph(

        // Containing div
        document.getElementById('graph_upload'),

        // CSV file
        config.data,

        // Options
        {
            labels: [
                t('date'),
                t('download'),
                t('upload')
            ],
            ylabel: t('speed_mbps'),
            visibility: [false, true],
            animatedZooms: true,
            xValueParser: parse_date,
            axes: {
                y: {
                    valueFormatter: format_speed,
                },
            },
            underlayCallback: threshold_painter(config.upload_guaranteed)
        }
    );

    g_upload.ready(function() {
        g_upload.updateOptions({
            zoomCallback: function(xmin, xmax, yranges) {
                alert("Zoomed to [" + xmin + ", " + xmax + "]");
                for (var i = 0; i < g_upload.numRows(); i++) {
                    console.log(g_upload.getValue(i, 0));
                }
            }
        });
    });
}


// Perform setup for given configuration
function config_setup(config) {

    //alert(JSON.stringify(config));

    // Change from relative to absolute units
    config.download_guaranteed =
        config.download_guaranteed * config.download_contracted;
    config.upload_guaranteed =
        config.upload_guaranteed * config.upload_contracted;

    // Set title
    document.title = config.title;
    $('#title').text(config.title);

    // Set organization
    $('#organization').text(config.organization);

    // Show config data
    $('#download_contracted').text(format_speed(config.download_contracted));
    $('#download_guaranteed').text(format_speed(config.download_guaranteed));
    $('#upload_contracted').text(format_speed(config.upload_contracted));
    $('#upload_guaranteed').text(format_speed(config.upload_guaranteed));

    // Configure language
    /// Load calendar locales
    $.getScript('locales/' + config.lang + '.js')
    .done(function(script, status) {
        $.datepicker.setDefaults(
            $.datepicker.regional[config.lang]
        );

        // Create calendar widgets
        $('#range_begin').datepicker({
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            onClose: function(selected) {
                $('#range_end').datepicker('option', 'minDate', selected);
            }
        });
        $('#range_end').datepicker({
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            onClose: function(selected) {
                $('#range_begin').datepicker('option', 'maxDate', selected);
            }
        });

        /// Localize text
        $.i18n.init({
            lng: config.lang,
            load: 'current',
            fallbackLng: false,
            resGetPath: 'locales/__lng__.json'
        }, function(t) {
            $('.i18n').i18n();
            config_graphs(t, config);
        });
    })
    .fail(function(xhr, opts, err) {
        msg = xhr.status + ' :: '+ err;
        console.log(msg);
    });
}


// Get configuration file
function config_load() {

    config_file = 'config.json';

    $.getJSON(config_file, {})
    .done(config_setup)
    .fail(function(xhr, opts, err) {
        msg = xhr.status + ' :: '+ err;
        console.log(msg);
    });
}

$(document).ready(config_load);
