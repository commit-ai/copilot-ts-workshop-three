#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
MSG=$(echo "$COMMAND" | grep -oP 'git commit(?: -m)?\s*"?\K[^"]+' | head -1 || echo "")

if [[ ! "$MSG" =~ ^[A-Z]{2,}-[0-9]+ ]]; then
  echo "❌ Commit '$MSG' missing Jira ticket (e.g., XYZ-123: message)" >&2
  echo '{"hookSpecificOutput": {"feedback": "Invalid commit convention"}}' 
else
  echo "✅ Valid Jira commit: $MSG"
fi
exit 0
