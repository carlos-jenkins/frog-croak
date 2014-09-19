==========
Frog Croak
==========

.. image:: https://pypip.in/v/frog-croak/badge.png
        :target: https://pypi.python.org/pypi/frog-croak/
        :alt: Latest Version
.. image:: https://pypip.in/d/frog-croak/badge.png
        :target: https://pypi.python.org/pypi/frog-croak/
        :alt: Downloads
.. image:: https://pypip.in/license/frog-croak/badge.png
        :target: https://pypi.python.org/pypi/frog-croak/
        :alt: License


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
    mv frog-croak-master/viewer/ <install path>


Possible improvements
=====================

- Implement an iperf collector for speed test between two computers.
  i.e between an in-home device and an external server.
- Implement other data sources other than a csv file.
  i.e Google AppEngine Datastore, nimbits.com, etc.
