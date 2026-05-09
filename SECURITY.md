# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Predator Bot Market seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. Email to [221651685@tut4life.ac.za](mailto:221651685@tut4life.ac.za)
2. GitHub Security Advisory (if enabled)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email.

## Security Best Practices

### For Contributors

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Keep dependencies up to date
- Follow secure coding practices

### For Users

- Keep your API keys secure
- Use strong passwords
- Enable two-factor authentication where possible
- Regularly update to the latest version

## Security Measures

This project implements:

- Input validation via Zod schemas
- Authentication via Clerk
- CORS protection
- Rate limiting (when deployed)
- Secure headers
- Dependency auditing via Dependabot
- Code scanning via CodeQL
