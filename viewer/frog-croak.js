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

// Pretty-print a speed value
function format_speed(speed) {
    return Number(speed).toFixed(2) + ' Mbps';
}

// Pretty print a percent value
function format_percent(percent) {
    return Number(percent * 100).toFixed(2) + ' %';
}

// Pretty-print a datetime locale-aware
function format_datetime(posix) {
    // See http://momentjs.com/docs/#/displaying/format/
    // Section "Localized formats"
    return moment(posix).format('L LT');
}

// Pretty-print a date locale-aware
function format_date(posix) {
    // See http://momentjs.com/docs/#/displaying/format/
    // Section "Localized formats"
    return moment(posix).format('L');
}

// Binary search implementation for looking in Dygraph data to the approximate
// point near xvalue.
function binary_search(graph, xvalue, xmin, xmax) {

    // Narrow search until one element remains
    while (xmin < xmax) {

        // Calculate mid-point
        var xmid = Math.floor(xmin + ((xmax - xmin) / 2));

        // Reduce the search
        if (graph.getValue(xmid, 0) < xvalue) {
            xmin = xmid + 1;
        } else {
            xmax = xmid;
        }
    }

    // DEBUG
    //var result = graph.getValue(xmin, 0);
    //console.log('xvalue is: ' + xvalue);
    //console.log('xmin is: ' + xmin);
    //console.log('value at xmin is: ' + result);
    //console.log('Which is: ' + moment(result).format("YYYY/MM/DD HH:mm:ss"));
    return xmin;
}

// Gather relevant information of data from given range
function analyse_range(graph, category, threshold, vindex, start, end) {

    // Find data indexes
    var index_start = binary_search(
        graph, start, 0, graph.numRows()
    );
    var index_end = binary_search(
        graph, end, 0, graph.numRows()
    );

    // Analyse data
    var count = 0;
    var sum = 0;
    var under = 0;
    var minv = Number.MAX_VALUE;
    var maxv = Number.MIN_VALUE;

    var value;

    for (var i = index_start; i <= index_end; i++) {
        value = graph.getValue(i, vindex);
        count++;
        sum += value;
        if (value < threshold) {
            under++;
        }
        if (value < minv) {
            minv = value;
        }
        if (value > maxv) {
            maxv = value;
        }
    }

    // DEBUG
    //console.log('count: ' + count);
    //console.log('sum: ' + sum);
    //console.log('under: ' + under);
    //console.log('minv: ' + minv);
    //console.log('maxv:' + maxv);
    //console.log('-------------');
    //console.log('Average: ' + (sum / count));
    //console.log('Non-compliance: ' + ((under / count) * 100));
    //console.log('Minimum: ' + minv);
    //console.log('Maximum: ' + maxv);

    $('#' + category + '_average').text(format_speed(sum / count));
    $('#' + category + '_non_compliance').text(format_percent(under / count));
    $('#' + category + '_minimum').text(format_speed(minv));
    $('#' + category + '_maximum').text(format_speed(maxv));
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
            labelsSeparateLines: true,
            labelsDivWidth: 150,
            axes: {
                x: {
                    valueFormatter: format_datetime,
                },
                y: {
                    valueFormatter: format_speed,
                },
            },
            underlayCallback: threshold_painter(config.download_guaranteed)
        }
    );

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
            labelsSeparateLines: true,
            labelsDivWidth: 150,
            axes: {
                x: {
                    valueFormatter: format_datetime,
                },
                y: {
                    valueFormatter: format_speed,
                },
            },
            underlayCallback: threshold_painter(config.upload_guaranteed)
        }
    );

    function update_ui(xmin, xmax, caller) {

        if (typeof(caller) === 'undefined') {
            caller = 'graph';
        }

        // Update statistics
        analyse_range(
            g_download,
            'download',
            config.download_guaranteed,
            1, xmin, xmax
        );

        analyse_range(
            g_upload,
            'upload',
            config.upload_guaranteed,
            2, xmin, xmax
        );

        if (caller === 'graph') {
            // Update calendars when caller is graph zoom callback
            $('#range_begin').datepicker('setDate', moment(xmin).toDate());
            $('#range_end').datepicker('setDate', moment(xmax).toDate());
        } else {
            // Update graphs when caller is calendars onSelect callback
            g_download.updateOptions({
                dateWindow: [xmin, xmax]
            });
            g_upload.updateOptions({
                dateWindow: [xmin, xmax]
            });

            //console.log(
            //    'New range: ' + moment(xmin) + ' <-> ' + moment(xmax)
            //);
        }
    }

    g_download.ready(function() {
        g_download.updateOptions({
            zoomCallback: function(xmin, xmax, yranges) {

                // Zoom counter part graph
                g_upload.updateOptions({
                    dateWindow: [xmin, xmax]
                });
                update_ui(xmin, xmax);
            }
        });
    });

    g_upload.ready(function() {
        g_upload.updateOptions({
            zoomCallback: function(xmin, xmax, yranges) {

                // Zoom counter part graph
                g_download.updateOptions({
                    dateWindow: [xmin, xmax]
                });
                update_ui(xmin, xmax);
            }
        });

        // Update UI of both graphs with initial range
        extremes = g_upload.xAxisExtremes();
        update_ui(extremes[0], extremes[1]);

        // One time calendar maximum boundary setup
        $('#range_begin').datepicker(
            'option', 'minDate', moment(extremes[0]).toDate()
        );
        $('#range_end').datepicker(
            'option', 'maxDate', moment(extremes[1]).toDate()
        );

        // One time configure calendar callback
        $('#range_begin').datepicker(
            'option', 'onSelect', function(date_text, inst) {

                var date = moment($(this).datepicker('getDate'));
                var range = g_upload.xAxisRange();

                //console.log('#range_begin: ' + date);

                // Update UI
                update_ui(date.valueOf(), range[1], 'calendar');

                // Set minimum date to end range
                $('#range_end').datepicker(
                    'option', 'minDate',
                    date.add(1, 'd').toDate()
                );
            }
        );
        $('#range_end').datepicker(
            'option', 'onSelect', function(date_text, inst) {

                var date = moment($(this).datepicker('getDate'));
                var range = g_upload.xAxisRange();

                //console.log('#range_end: ' + date);

                // Update UI
                update_ui(range[0], date.valueOf(), 'calendar');

                // Set minimum date to start range
                $('#range_begin').datepicker(
                    'option', 'maxDate',
                    date.subtract(1, 'd').toDate()
                );
            }
        );
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
            changeYear: true
        });
        $('#range_end').datepicker({
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true
        });

        /// Localize dates (moment.js)
        moment.locale(config.lang);

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
