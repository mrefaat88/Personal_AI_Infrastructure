# MCP Integration Methodology

## Overview

This methodology achieved **99.5% token savings** when migrating Google MCPs from slash commands to code execution. It's reusable for ANY MCP server.

## Step-by-Step Process

### Phase 1: Planning & Baseline

#### 1.1 Identify MCP Operations

List all operations you need from the MCP:
- What actions will users perform?
- What data needs to be retrieved?
- What workflows need to be supported?

**Example (Google Tasks):**
- Create task
- List tasks
- Update task
- Delete task
- Mark complete

#### 1.2 Measure Baseline (if migrating)

If migrating from slash commands, measure current token usage:

```bash
# Use pctx to measure token counts
pctx --estimate "context with slash commands"
```

**Google Tasks Baseline:**
- Simple query: 23,750 tokens
- Complex query: 200,000+ tokens
- Multi-step workflow: 300,000+ tokens

#### 1.3 Plan Integration Strategy

Decide which operations to integrate first:
1. Start with simplest operation (proof of concept)
2. Add more operations incrementally
3. Test real-world workflows
4. Validate token savings

### Phase 2: Proof of Concept

#### 2.1 Create First Wrapper

Start with the simplest operation to validate approach.

**Steps:**
1. Copy `templates/mcp-wrapper-template.ts`
2. Customize for your MCP
3. Test standalone

**Example:**
```typescript
// servers/your-mcp/simple_operation.ts
import { Client } from "@brandcast_app/mcp-client-cli";

async function simpleOperation(params: any) {
  const client = new Client({
    name: "your-mcp-server",
    version: "1.0.0",
  });

  await client.initialize([configPath]);
  const result = await client.callTool("simple_tool", params);

  return result;
}

export { simpleOperation };
```

#### 2.2 Test Token Savings

Create a test that measures token usage:

```typescript
// examples/test-simple-query.ts
import { simpleOperation } from '../servers/your-mcp';

async function main() {
  const result = await simpleOperation({ param: "value" });
  console.log(JSON.stringify(result));
}

main();
```

**Measure:**
```bash
# Count tokens in code execution approach
pctx --estimate "code execution context"
```

**Expected:** 95%+ token reduction

#### 2.3 Validate Approach

Questions to answer:
- ✅ Does it work reliably?
- ✅ Are credentials handled securely?
- ✅ Are errors handled properly?
- ✅ Is token reduction significant (95%+)?

### Phase 3: Full Integration

#### 3.1 Create Wrappers for All Operations

For each operation:
1. Copy template
2. Customize for operation
3. Test standalone
4. Add to index.ts

**Directory structure:**
```
servers/your-mcp/
├── index.ts                 # Export all functions
├── operation1.ts            # First operation
├── operation2.ts            # Second operation
└── ...
```

**index.ts pattern:**
```typescript
export { operation1 } from './operation1';
export { operation2 } from './operation2';
// ... export all operations
```

#### 3.2 Update Skills

Create or update skills to use code execution:

```markdown
---
name: your-mcp-skill
description: |
  Interact with YOUR_MCP using code execution
---

## Code Execution Pattern

```typescript
import { operation1 } from '/path/to/servers/your-mcp';

async function main() {
  const result = await operation1(params);
  console.log(JSON.stringify(result));
}
```
```

#### 3.3 Test Real-World Workflows

Create comprehensive tests:

**Simple workflow:**
```typescript
// Test single operation
const result = await operation1(params);
```

**Complex workflow:**
```typescript
// Test multiple operations
const list = await listItems();
const filtered = list.filter(/* ... */);
const updated = await updateItem(filtered[0].id, { /* ... */ });
```

**Multi-MCP workflow:**
```typescript
// Test orchestration across MCPs
const task = await createTask({ title: "Meeting" });
const event = await createCalendarEvent({
  title: task.title,
  start: task.due
});
```

### Phase 4: Validation

#### 4.1 Comprehensive Testing

Test all scenarios:
- ✅ All operations work individually
- ✅ Multi-operation workflows work
- ✅ Error handling works
- ✅ Edge cases handled
- ✅ Real-world user scenarios

**Test pattern:**
```typescript
// examples/test-all-operations.ts
async function main() {
  console.log('Testing all operations...\n');

  // Test 1: Operation 1
  console.log('Test 1: Operation 1');
  await testOperation1();

  // Test 2: Operation 2
  console.log('Test 2: Operation 2');
  await testOperation2();

  // ... test all operations
}
```

#### 4.2 Security Audit

Verify security:
- ✅ Credentials never in prompts
- ✅ OAuth flows secure
- ✅ No sensitive data in logs
- ✅ Input validation
- ✅ Error messages don't leak data

**Reference:** `docs/security-audit.md`

#### 4.3 Performance Validation

Measure performance:
- ✅ Token counts vs baseline
- ✅ Response time
- ✅ Resource usage

**Reference:** `docs/performance-validation.md`

#### 4.4 Documentation

Document everything:
- ✅ README.md (overview)
- ✅ USAGE-GUIDE.md (how to use)
- ✅ Integration guide (this!)
- ✅ Troubleshooting (common issues)

## Common Patterns

### Pattern 1: Simple Operation

**Use case:** Single MCP call, no processing

```typescript
export async function simpleOp(params: any) {
  const client = new Client({ name: "mcp-server", version: "1.0.0" });
  await client.initialize([configPath]);
  return await client.callTool("tool_name", params);
}
```

### Pattern 2: Processing Results

**Use case:** MCP call + data transformation

```typescript
export async function processedOp(params: any) {
  const client = new Client({ name: "mcp-server", version: "1.0.0" });
  await client.initialize([configPath]);

  const result = await client.callTool("tool_name", params);

  // Process result
  const processed = result.items.map(item => ({
    id: item.id,
    name: item.title,
    // ... transform
  }));

  return processed;
}
```

### Pattern 3: Multi-Operation Workflow

**Use case:** Multiple MCP calls in sequence

```typescript
export async function workflow(params: any) {
  const client = new Client({ name: "mcp-server", version: "1.0.0" });
  await client.initialize([configPath]);

  // Step 1: Get data
  const items = await client.callTool("list_items", {});

  // Step 2: Filter
  const filtered = items.filter(/* ... */);

  // Step 3: Update
  for (const item of filtered) {
    await client.callTool("update_item", {
      id: item.id,
      /* ... */
    });
  }

  return { updated: filtered.length };
}
```

### Pattern 4: Multi-MCP Orchestration

**Use case:** Coordinate across multiple MCPs

```typescript
import { mcpA } from './servers/mcp-a';
import { mcpB } from './servers/mcp-b';

async function orchestrate(params: any) {
  // Step 1: MCP A
  const resultA = await mcpA.operation(params);

  // Step 2: MCP B (using result from A)
  const resultB = await mcpB.operation({
    data: resultA.id
  });

  return { a: resultA, b: resultB };
}
```

## Error Handling

### Pattern 1: Wrapper-Level Errors

```typescript
export async function operation(params: any) {
  try {
    const client = new Client({ name: "mcp-server", version: "1.0.0" });
    await client.initialize([configPath]);
    return await client.callTool("tool_name", params);
  } catch (error) {
    throw new Error(`Operation failed: ${error.message}`);
  }
}
```

### Pattern 2: Test-Level Errors

```typescript
async function main() {
  try {
    const result = await operation(params);
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
```

## Credential Handling

### OAuth Tokens

```typescript
const credentials = {
  tokenPath: path.resolve(
    process.env.HOME || "",
    ".config/your-mcp/oauth-token.json"
  ),
};

// Pass to MCP client
await client.initialize([configPath], credentials);
```

### API Keys

```typescript
const credentials = {
  apiKey: process.env.YOUR_MCP_API_KEY,
};

// Pass to MCP client
await client.initialize([configPath], credentials);
```

## Best Practices

### 1. Incremental Development
- Start with one operation
- Test thoroughly
- Add more operations
- Don't try to do everything at once

### 2. Clear Naming
- Use descriptive function names
- Match MCP tool names where possible
- Be consistent across operations

### 3. Export Pattern
```typescript
// Good: Named exports
export { operation1, operation2 };

// Avoid: Default exports
export default { operation1, operation2 };
```

### 4. Testing First
- Test each wrapper standalone
- Then test in combination
- Then test real-world scenarios

### 5. Documentation
- Document parameters
- Document return values
- Document error cases
- Provide examples

## Troubleshooting

### Issue: MCP client connection fails

**Solution:**
1. Check config file path
2. Verify MCP server is running
3. Check credentials

### Issue: Tool call returns error

**Solution:**
1. Verify tool name is correct
2. Check parameter format
3. Review MCP server logs

### Issue: OAuth credentials expire

**Solution:**
1. Implement token refresh
2. Handle expiration gracefully
3. Prompt user to re-authenticate

## Success Criteria

Integration is complete when:
- ✅ All operations work reliably
- ✅ 95%+ token reduction achieved
- ✅ Security audit passed
- ✅ Real-world workflows tested
- ✅ Documentation complete
- ✅ Troubleshooting guide created

## Next Steps

After integration:
1. **Deploy to production** - See `PRODUCTION-DEPLOYMENT-HANDOFF.md`
2. **Monitor usage** - Track performance and errors
3. **Iterate** - Add more operations as needed
4. **Share learnings** - Document for future integrations

---

**Questions?** See `docs/troubleshooting.md` or review `examples/` for working code.
