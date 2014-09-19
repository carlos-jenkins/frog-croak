# -*- coding: utf-8 -*-
#
# Copyright (C) 2014 Carlos Jenkins <carlos@jenkins.co.cr>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""
Frog Croak data provider using speedtest.net.
"""

from __future__ import print_function

from os.path import dirname
from datetime import datetime

from speedtest_cli import register_signal_handler
from speedtest_cli import getConfig, closestServers, getBestServer
from speedtest_cli import downloadSpeed, uploadSpeed


def take_sample(verbose=True):

    # Register CTRL-C signal handler
    register_signal_handler()

    # Get speedtest.net configuration
    if verbose:
        print('Retrieving speedtest.net configuration...')
    config = getConfig()

    if verbose:
        print('Testing from {isp} ({ip})...'.format(**config['client']))

    # Get closest servers
    if verbose:
        print('Retrieving speedtest.net server list...')
    servers = closestServers(config['client'])

    # Select best server from closest servers
    if verbose:
        print('Selecting best server based on latency...')
    best = getBestServer(servers)

    if verbose:
        print(
            'Testing against server hosted by {sponsor} ({name}) '
            '[{d:2f} km]: {latency} ms'.format(**best)
        )

    # Get download speed
    if verbose:
        print('Testing download speed', end='')

    sizes = [350, 500, 750, 1000, 1500, 2000, 2500, 3000, 3500, 4000]
    urls = []
    for size in sizes:
        for i in range(0, 4):
            urls.append(
                '{}/random{}x{}.jpg'.format(dirname(best['url']), size, size)
            )
    dlspeed = downloadSpeed(urls, not verbose)

    if verbose:
        print()
        print('Download: {:.2f} Mbps'.format((dlspeed / 1000 / 1000)))

    # Get upload speed
    if verbose:
        print('Testing upload speed', end='')

    sizes = []
    sizesizes = [int(25 * 1000 * 1000), int(5 * 1000 * 1000)]
    for size in sizesizes:
        for i in range(0, 25):
            sizes.append(size)

    ulspeed = uploadSpeed(best['url'], sizes, not verbose)

    if verbose:
        print()
        print('Upload: {:.2f} Mbps'.format((ulspeed / 1000 / 1000)))

    # Set timestamp
    now = datetime.now().replace(microsecond=0).isoformat()

    return {
        'timestamp': now,
        'download': dlspeed,
        'upload' : ulspeed
    }


__all__ = ['take_sample']
