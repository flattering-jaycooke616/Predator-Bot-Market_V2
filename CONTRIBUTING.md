# Contributing to Predator Bot Market

Thank you for your interest in contributing to Predator Bot Market! This document provides guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include as many details as possible:

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected vs actual behavior
- Screenshots if applicable
- Your environment details

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/Lintshiwe/Predator-Bot-Market_V2.git

# Install dependencies
pnpm install

# Run typecheck
pnpm run typecheck

# Build all packages
pnpm run build
```

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Project Structure

```
├── artifacts/
│   ├── api-server/      # Express.js API server
│   ├── predator-bots/   # React frontend
│   └── mockup-sandbox/  # Mockup sandbox
├── lib/
│   ├── api-client-react/ # React API client
│   ├── api-spec/        # OpenAPI specification
│   ├── api-zod/         # Zod schemas
│   └── db/              # Database schemas and migrations
└── scripts/             # Utility scripts
```

## Questions?

Feel free to open an issue with your question.
