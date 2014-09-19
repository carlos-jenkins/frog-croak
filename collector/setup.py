#!/usr/bin/env python

from distutils.core import setup

setup(
    name='frog-croak',
    version='1.0',
    package_dir={'' : 'lib'},
    packages=[
        'frog-croak',
        'frog-croak.speedtest'
    ],
    scripts=['bin/frog-croak'],
)
