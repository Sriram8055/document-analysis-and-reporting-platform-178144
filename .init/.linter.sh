#!/bin/bash
cd /home/kavia/workspace/code-generation/document-analysis-and-reporting-platform-178144/document_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

