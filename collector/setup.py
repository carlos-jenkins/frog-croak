#!/usr/bin/env python

from distutils.core import setup

with open('README.txt') as fd:
    long_description = fd.read()


setup(
    # Main
    name='frog-croak',
    version='1.1',
    package_dir={'' : 'lib'},
    packages=[
        'frog_croak',
        'frog_croak.speedtest'
    ],
    scripts=['bin/frog-croak'],

    # Extra metadata
    author='Carlos Jenkins',
    author_email='carlos@jenkins.co.cr',
    url='https://github.com/carlos-jenkins/frog-croak/',
    description='Internet connection speed and monitor tool.',
    long_description=long_description,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Telecommunications Industry',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: POSIX',
        'Operating System :: POSIX :: Linux',
        'Operating System :: Unix',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.2',
        'Programming Language :: Python :: 3.4',
        'Topic :: Internet',
        'Topic :: System :: Monitoring',
        'Topic :: Utilities',
    ],
)
