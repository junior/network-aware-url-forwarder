#!/bin/bash
if [ -z "$EXTERNAL_URL" ]; then
	echo "Url target variable not set (EXTERNAL_URL)"
	exit 1
else

	echo "When on internal network, forwarding requests to: ${EXTERNAL_URL}..."
	echo "When on internet, forwarding requests to: ${INTERNAL_URL}..."
	echo "Using this image endpoint to check the internal network: ${NETWORK_TEST_URL}..."
fi

node app.js
