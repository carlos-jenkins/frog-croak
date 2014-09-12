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

// Create and configure graphs
function config_graphs(t, config) {

    // Create download graph
    g1 = new Dygraph(

        // Containing div
        document.getElementById('graphs_download'),

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
            visibility: [true, false]
        }
    );

    // Create upload graphs
    g2 = new Dygraph(

        // Containing div
        document.getElementById('graphs_upload'),

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
            visibility: [false, true]
        }
    );
}


// Perform setup for given configuration
function config_setup(config) {

    //alert(JSON.stringify(config));

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
