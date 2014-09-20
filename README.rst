==========
Frog Croak
==========

.. image:: https://pypip.in/py_versions/frog-croak/badge.png?style=original
   :target: https://pypi.python.org/pypi/frog-croak/
   :alt: Supported Python versions

.. image:: https://pypip.in/version/frog-croak/badge.png?text=version
   :target: https://pypi.python.org/pypi/frog-croak/
   :alt: Latest Version

.. image:: https://pypip.in/download/frog-croak/badge.png?style=original
   :target: https://pypi.python.org/pypi/frog-croak/
   :alt: Downloads

.. image:: https://pypip.in/license/frog-croak/badge.png?style=original
   :target: https://pypi.python.org/pypi/frog-croak/
   :alt: License

.. image:: https://pypip.in/status/frog-croak/badge.png?style=original
   :target: https://pypi.python.org/pypi/frog-croak/
   :alt: Status


About
=====

Frog Croak is a tool that allows users to monitor and analyse their Internet
connection speed over time.

For a live demo visit: http://speed.jenkins.co.cr/

.. image:: https://raw.githubusercontent.com/carlos-jenkins/frog-croak/master/screenshot.png
        :target: http://speed.jenkins.co.cr/
        :alt: Live Demo


It is composed of two separate programs:

- *Viewer*: A Javascript application that allows to display and analyse
  gathered data.
- *Collector*: A Python application that collects speed tests data samples over
  time.


The *Viewer* and the *Collector* can be installed in different machines or in
the same machine, depending on your setup.


Features
========

- Independent download and upload graphs.
- Interactive data graphs.
- Selectable date range.
- Data analysis in selected range:

  - Average.
  - Guaranteed speed threshold.
  - Non-compliance percent.
  - Maximum.
  - Minimum.

- Fully localized (date formats, UI text, etc).
- Easily configurable (``config.json``).
- Viewer is full client side Javascript and HTML, it doesn't require any
  backend technology other than a simple web server.


Installation
============

Collector
+++++++++

::

    sudo pip install frog-croak


Viewer
++++++

::

    wget https://github.com/carlos-jenkins/frog-croak/archive/master.zip -O frog-croak.zip
    unzip frog-croak.zip
    mv frog-croak-master/viewer/ [install path]


Note: ``[install path]`` must be served by a web server. For example, if using
Apache in Ubuntu, it could be something like ``/var/www/html/speed/``.


Usage
=====

Collector
+++++++++

Call the ``frog-croak`` binary each time you want to get a speed sample.

::

    $ frog-croak --help
    usage: frog-croak [-h] [--silent] [--output OUTPUT]

    Frog Croak data collector utility.

    optional arguments:
      -h, --help       show this help message and exit
      --silent         Do not display information on utility execution.
      --output OUTPUT  CSV out file.

This will add to (or create) the new entry to the output file
(by default ``data.csv``). This file name must be configured in the *Viewer*.

One option is to call ``frog-croak`` from ``cron``. How you setup ``cron``
depends if the *Viewer* is running in the same computer or not.


Same computer
-------------

Just configure ``cron`` to call ``frog-croak`` with the output file set to feed
the data file specified in the *Viewer* configuration file. Make sure the user
that is executing the ``cron`` job has write permissions to data file.

::

    $ sudo crontab -u www-data -e
    50 * * * * /usr/local/bin/frog-croak --output /var/www/html/speed/data.csv

This will add a speed sample once per hour at minute 50.


Different computers
-------------------

In this scenario one computer (possibly a Raspberry PI, Beagle Bone Black,
or similar) will run the *Collector* and a second (possible a VPS or external
web server) will run the *Viewer*.

In this case the ``cron`` job will require to copy the updated output file to
the machine hosting the *Viewer*. There are too many ways to accomplish this
(``ftp``, ``scp``, ``rsync``, ``nfs``, etc). In this example we use ``scp``
to copy to the host ``'external'``.

::

    $ crontab -e
    50 * * * * /home/myuser/speed/speed.sh


::

    $ cat /home/myuser/speed/speed.sh
    #!/bin/bash
    set -e

    # Env variables
    PATH=/usr/local/bin:/usr/bin:/bin

    cd /home/myuser/speed
    frog-croak --silent
    scp data.csv external:/var/www/html/speed/


Viewer
++++++

Once extracted you will find a file called ``config.json`` in the *Viewer*
installation directory. Edit this file to meet your needs:

::

    {
        "data": "data.csv",
        "lang" : "en",
        "title": "Internet Speed Test Log",
        "organization": "My Organization",
        "download_contracted": 5.0,
        "download_guaranteed": 0.8,
        "upload_contracted": 1.0,
        "upload_guaranteed": 0.8
    }


:data: URL to speed samples file. This file is the one updated by the
 *Collector*. This is **NOT** a path in the file system, it is a URL from which
 that Javascript can download the file.
:lang: Language and localization setting. You language needs to be available
 in ``locales/``. Contributions are welcome.
:title: Document title. This will appear in the right bar and document title.
:organization: Optional name of your organization. Or whatever you want to be
 written below the document title in the right bar.
:download_contracted: The download speed contracted with your ISP in Mbps.
:download_guaranteed: The percent of the contracted speed that your ISP is
 supposed to guarantee as a float between ``[0.1, 1.0]``.
:upload_contracted: Same as ``download_contracted`` but for upload speed.
:upload_guaranteed: Same as ``download_guaranteed`` but for upload speed.


You should be able to load the *Viewer* from you browser pointing to the URL
serving it.

With the calendars on the right or selection a range in the graphs you can
select a specific range of dates. Statistics will updated for the selected
range. Double click the graph to quickly return to the original (full) range.


Possible improvements
=====================

- Implement an iperf collector for speed test between two computers.
  i.e between an in-home device and an external server.
- Implement other data sources other than a csv file.
  i.e Google AppEngine Datastore, nimbits.com, etc.
