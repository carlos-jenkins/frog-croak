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


// Parse an ISO 8601 date using moment.js for cross-browser consisten results
function parse_date(string) {
    return moment(string).toDate();
}


// Pretty-print the speed value
function format_speed(speed) {
    return speed + ' Mbps';
}


// Create and configure graphs
function config_graphs(t, config) {

    var graphs = ['download', 'upload'];
    var thresholds = [
        config.download_guaranteed,
        config.upload_guaranteed
    ];

    for (var i = 0; i < 2; i++) {

        // Create graph
        // FIXME: valueFormatter: add Mbps as formatter
        new Dygraph(

            // Containing div
            document.getElementById('graph_' + graphs[i]),

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
                visibility: [i === 0, i === 1],
                underlayCallback: threshold_painter(thresholds[i]),
                animatedZooms: true,
                xValueParser: parse_date,
                axes: {
                    y: {
                        valueFormatter: format_speed,
                    },
                },
            }
        );

    }
}


// Perform setup for given configuration
function config_setup(config) {

    //alert(JSON.stringify(config));

    // Change from relative to absolute units
    config.download_guaranteed =
        config.download_guaranteed * config.download_contracted;
    config.upload_guaranteed =
        config.upload_guaranteed * config.upload_contracted;

    // Configure language
    $.getScript(
        'locales/' + config.lang + '.js'
    );
    $.i18n.init({
        lng: config.lang,
        load: 'current',
        fallbackLng: false,
        resGetPath: 'locales/__lng__.json'
    }, function(t) {
        $('.i18n').i18n();
        config_graphs(t, config);
    });

    // Set title
    document.title = config.title;
    $('#title').text(config.title);

    // Set organization
    $('#organization').text(config.organization);

    // Create calendar widgets
    $.datepicker.setDefaults(
        $.datepicker.regional['es']
    );
    $('.calendar').datepicker();

    // Show config data
    $('#download_contracted').text(format_speed(config.download_contracted));
    $('#download_guaranteed').text(format_speed(config.download_guaranteed));
    $('#upload_contracted').text(format_speed(config.upload_contracted));
    $('#upload_guaranteed').text(format_speed(config.upload_guaranteed));
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
