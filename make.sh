#!/bin/bash

if [[ -f lan-ip-address.zip ]] ; then rm lan-ip-address.zip ; fi
zip -9 lan-ip-address.zip extension.js utils.js LanIPAddressIndicator.js metadata.json *.md

