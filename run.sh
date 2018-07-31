#!/bin/bash
while [ 1 -eq 1 ]
do
	node index.js || echo "ATB crashed. Restarting." >&2
	echo "Press C-c to quit." && sleep 1
done
