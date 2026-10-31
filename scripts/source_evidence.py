"""Immutable public-source evidence shared by maintenance readers.

A URL can produce multiple representations (HTML, API JSON) and multiple
versions in one run. Include the content digest so a later read cannot erase
an earlier observation. This stores evidence; it does not establish coverage.
"""
import hashlib
from pathlib import Path


def store_source_evidence(directory, key, raw):
    if not isinstance(raw, bytes):
        raise TypeError('Source evidence must be bytes')
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(raw).hexdigest()
    key_digest = hashlib.sha256(key.encode('utf-8')).hexdigest()[:16]
    name = f'{key_digest}-{digest}.txt'
    destination = directory / name
    try:
        with destination.open('xb') as stream:
            stream.write(raw)
    except FileExistsError:
        if destination.read_bytes() != raw:
            raise ValueError('Existing evidence does not match its content digest')
    return {'file': name, 'hash': digest}
