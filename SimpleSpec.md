📝 Specification: passgen CLI
Objective: Build a Go-based CLI tool that generates secure, random passwords.

Requirements:

Core Logic: A Generate(length int, includeSpecial bool) string function.
CLI Interface:
--length <n> (Default: 12)
--special (Toggle to include symbols like !@#$%)
Persistence: None needed (pure CLI).
Testing: Unit tests for the generator logic ensuring the correct length and character set.
Desired File Structure:

cmd/passgen/main.go: CLI entry point (handles flags).
internal/generator/generator.go: The actual logic.
internal/generator/generator_test.go: Tests.
