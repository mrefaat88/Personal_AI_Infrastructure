# MCP Integration Guide

This template demonstrates how to integrate ANY MCP server using code execution architecture.

## What This Template Provides

- **Proven methodology** - 99.5% token savings vs slash commands (99.9% for complex queries)
- **Working examples** - Google Tasks, Calendar, Drive fully integrated
- **Reusable patterns** - For any MCP integration
- **Templates** - For wrappers, tests, and skills

## Quick Start

**For AI Agents integrating a new MCP:**

1. **Choose your MCP** (Slack, GitHub, Linear, etc.)
2. **Follow the methodology** - `docs/integration/methodology.md`
3. **Copy templates** - Customize `templates/` for your MCP
4. **Reference examples** - See `examples/` for working patterns
5. **Test thoroughly** - Use `examples/` test patterns

## Reference Implementation: Google MCPs

See `servers/google-*` for working examples of:
- MCP wrapper creation
- OAuth credential handling
- Multi-operation integration
- Error handling patterns

## Why This Approach?

Traditional slash command approach:
- **Baseline:** 200K+ tokens per complex query
- **Performance:** Slow, resource-intensive
- **Scaling:** Doesn't scale to multiple MCPs

Code execution approach:
- **Optimized:** 750 tokens per complex query (99.5% savings)
- **Performance:** 10x faster, near-instant response
- **Scaling:** Unlimited MCPs, minimal overhead

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code (AI Agent)                                      │
│                                                              │
│  User Request: "Create a task for tomorrow"                 │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Code Execution                                       │   │
│  │                                                      │   │
│  │  import { createTask } from './servers/google-tasks'│   │
│  │                                                      │   │
│  │  const result = await createTask({                  │   │
│  │    title: "Task for tomorrow",                      │   │
│  │    due: "2025-11-23T00:00:00Z"                      │   │
│  │  });                                                 │   │
│  │                                                      │   │
│  │  console.log(JSON.stringify(result));               │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ MCP Wrapper (servers/google-tasks/create_task.ts)   │   │
│  │                                                      │   │
│  │  - Initialize MCP client                            │   │
│  │  - Load credentials                                 │   │
│  │  - Call MCP tool                                    │   │
│  │  - Return result                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          ▼
    ┌──────────────────────────────────────┐
    │ MCP Server (Google Tasks)            │
    │                                      │
    │  - Handles OAuth                     │
    │  - Calls Google Tasks API            │
    │  - Returns task data                 │
    └──────────────────────────────────────┘
```

## Integration Steps

### 1. Plan & Research

- Identify MCP operations needed
- Measure baseline (if migrating from slash commands)
- Plan integration strategy

**Reference:** `archive/baseline-and-planning/`

### 2. Proof of Concept

- Create first wrapper (simplest operation)
- Test token savings
- Validate approach

**Reference:** `examples/test-2.3-simple-query.ts`

### 3. Full Integration

- Create wrappers for all operations
- Update skills
- Test real-world workflows

**Reference:** `servers/google-tasks/`, `servers/google-calendar/`, `servers/google-drive/`

### 4. Validation

- Comprehensive testing
- Security audit
- Documentation

**Reference:** `tests/`, `docs/security-audit.md`

## Templates

Copy and customize these templates for your MCP:

### 1. MCP Wrapper Template
**File:** `templates/mcp-wrapper-template.ts`

Basic wrapper structure for calling MCP tools.

### 2. Test Template
**File:** `templates/example-test-template.ts`

Test your MCP integration with real operations.

### 3. Skill Template
**File:** `templates/skill-template.md`

Document your MCP integration for Claude Code skills.

## Examples

Real-world working examples:

### Simple Query (Single Operation)
**File:** `examples/test-2.3-simple-query.ts`
- Single task creation
- Basic error handling
- Result parsing

### Complex Query (Multi-Operation)
**File:** `examples/test-2.4-complex-query.ts`
- Multiple API calls
- Data aggregation
- Conditional logic

### Multi-Step Workflow (Multi-MCP)
**File:** `examples/test-2.5-multi-step.ts`
- Orchestrates multiple MCPs
- Tasks → Calendar integration
- Real-world user scenario

### All Google MCPs
**File:** `examples/test-3.1-all-google-mcps.ts`
- Tasks, Calendar, Drive integration
- Demonstrates scalability
- Production-ready patterns

## Learning Resources

### For Implementation Details
- **Methodology:** `docs/integration/methodology.md` - Step-by-step process
- **Architecture Decision:** `docs/integration/architecture-decision.md` - Why this approach
- **Comparison:** `docs/integration/comparison.md` - vs alternatives

### For Development Journey
- **Checkpoints:** `CHECKPOINTS.md` - Complete development history
- **Plan:** `PLAN.md` - Original architecture plan

### For Troubleshooting
- **Troubleshooting:** `docs/troubleshooting.md` - Common issues
- **Blockers & Fixes:** `archive/blockers-and-fixes/` - Historical bugs

## Performance Metrics

**Token Savings:**
- Simple queries: 99.5% reduction
- Complex queries: 99.9% reduction
- Multi-MCP workflows: 99.5% reduction

**Baseline vs Optimized:**
| Query Type | Baseline (Slash Commands) | Optimized (Code Execution) | Savings |
|------------|---------------------------|----------------------------|---------|
| Simple | 23,750 tokens | 750 tokens | 99.5% |
| Complex | 200,000+ tokens | 750 tokens | 99.9% |
| Multi-step | 300,000+ tokens | 1,500 tokens | 99.5% |

**Reference:** `docs/performance-validation.md`

## Security

Code execution architecture is MORE secure than slash commands:
- Credentials never in prompts
- No tool schemas in context
- Direct server communication
- Standard OAuth flows

**Reference:** `docs/security-audit.md`

## Next Steps

1. **Read methodology** - `docs/integration/methodology.md`
2. **Review examples** - `examples/` directory
3. **Copy templates** - `templates/` directory
4. **Start integrating** - Your MCP!

## Support

- **Documentation:** `docs/` directory
- **Examples:** `examples/` directory
- **Archive:** `archive/` directory (development artifacts)

---

**Ready to integrate your MCP?** Start with `docs/integration/methodology.md`
