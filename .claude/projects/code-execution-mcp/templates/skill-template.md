---
name: your-mcp-skill
description: |
  REPLACE: Brief description of what this skill does and when to use it.
  Example: "Interact with Slack to send messages, create channels, and manage workspace using code execution (99.5% token savings)."
---

# YOUR_MCP Skill

REPLACE: Provide overview of the MCP and what this skill enables.

## When to Use This Skill

Use this skill when the user asks to:
- REPLACE: List specific user requests that trigger this skill
- Example: "Send a message to Slack"
- Example: "Create a new channel"
- Example: "List all channels"

## How It Works

This skill uses **code execution** to access YOUR_MCP with **99.X% token savings** compared to traditional slash commands.

**Key benefits:**
- Near-instant response time
- No tool schemas in context
- Secure credential handling
- Scales to unlimited operations

## Code Execution Pattern

All YOUR_MCP operations use this pattern:

```typescript
import { yourFunction } from '/absolute/path/to/servers/your-mcp';

async function main() {
  const result = await yourFunction({
    // parameters
  });
  console.log(JSON.stringify(result));
}

main();
```

## Available Operations

REPLACE: List all operations available through this MCP integration.

### Operation 1: Function Name

**Purpose:** REPLACE: What this operation does

**Code:**
```typescript
import { functionName } from '/path/to/servers/your-mcp';

async function main() {
  const result = await functionName({
    param1: "value1",
    param2: "value2",
  });
  console.log(JSON.stringify(result));
}
```

**Parameters:**
- `param1` (string): REPLACE: Description
- `param2` (string): REPLACE: Description

**Returns:**
- REPLACE: Description of return value

### Operation 2: Another Function

**Purpose:** REPLACE: What this operation does

**Code:**
```typescript
import { anotherFunction } from '/path/to/servers/your-mcp';

async function main() {
  const result = await anotherFunction({
    param1: "value1",
  });
  console.log(JSON.stringify(result));
}
```

**Parameters:**
- `param1` (string): REPLACE: Description

**Returns:**
- REPLACE: Description of return value

## Common Workflows

REPLACE: Document common multi-step workflows.

### Workflow 1: Common Task

**User request:** "REPLACE: Example user request"

**Code:**
```typescript
import { function1, function2 } from '/path/to/servers/your-mcp';

async function main() {
  // Step 1: REPLACE: Description
  const step1 = await function1({ /* ... */ });

  // Step 2: REPLACE: Description
  const step2 = await function2({
    id: step1.id,
    /* ... */
  });

  console.log(JSON.stringify(step2));
}
```

### Workflow 2: Multi-MCP Integration

**User request:** "REPLACE: Example request involving multiple MCPs"

**Code:**
```typescript
import { yourMcpFunction } from '/path/to/servers/your-mcp';
import { otherMcpFunction } from '/path/to/servers/other-mcp';

async function main() {
  // Step 1: YOUR_MCP operation
  const result1 = await yourMcpFunction({ /* ... */ });

  // Step 2: Other MCP operation (using result from step 1)
  const result2 = await otherMcpFunction({
    data: result1.id,
    /* ... */
  });

  console.log(JSON.stringify({ result1, result2 }));
}
```

## Error Handling

All operations include error handling:

```typescript
import { yourFunction } from '/path/to/servers/your-mcp';

async function main() {
  try {
    const result = await yourFunction({ /* ... */ });
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error('Operation failed:', error.message);
    // Handle error appropriately
  }
}
```

## Best Practices

1. **Always use absolute paths** in imports
2. **Output JSON** for structured data: `console.log(JSON.stringify(result))`
3. **Handle errors** gracefully with try/catch
4. **Test operations** before deploying to production
5. **Use descriptive variable names** for clarity

## Examples

REPLACE: Link to working examples

See working examples:
- `examples/test-your-mcp-simple.ts` - Simple operations
- `examples/test-your-mcp-complex.ts` - Complex workflows
- `examples/test-your-mcp-multi-step.ts` - Multi-step workflows

## Troubleshooting

REPLACE: Add common issues and solutions

### Issue: Connection fails

**Solution:**
1. Verify MCP server is running
2. Check credentials are valid
3. Review config file path

### Issue: Operation returns error

**Solution:**
1. Verify parameters are correct
2. Check parameter types and formats
3. Review MCP server logs

### Issue: Credentials expired

**Solution:**
1. Re-authenticate with YOUR_MCP
2. Update token in config
3. Retry operation

## Reference Documentation

- **Setup Guide:** `README.md`
- **Usage Guide:** `USAGE-GUIDE.md`
- **Integration Guide:** `INTEGRATION-GUIDE.md`
- **Troubleshooting:** `docs/troubleshooting.md`

## Performance

**Token savings:** 99.X% reduction vs slash commands

| Operation Type | Baseline | Optimized | Savings |
|---------------|----------|-----------|---------|
| Simple | XX,XXX tokens | XXX tokens | 99.X% |
| Complex | XXX,XXX tokens | XXX tokens | 99.X% |
| Multi-step | XXX,XXX tokens | X,XXX tokens | 99.X% |

See `docs/performance-validation.md` for detailed metrics.

## Security

- ✅ Credentials never in prompts
- ✅ Secure OAuth flows
- ✅ No tool schemas in context
- ✅ Direct server communication

See `docs/security-audit.md` for security details.

---

**Need help?** See `docs/troubleshooting.md` or review `examples/` directory.
