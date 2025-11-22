{
  description = "Preference Injector - Universal Application Automation Standard";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [];
        };

        # Project metadata
        pname = "preference-injector";
        version = "2.0.0";

        # Development dependencies
        nativeBuildInputs = with pkgs; [
          # Core runtime
          deno

          # Build tools
          just
          git

          # Optional but recommended
          nodePackages.typescript
          nodePackages.typescript-language-server

          # ReScript (if available)
          # nodePackages.rescript  # Uncomment if using ReScript

          # Database tools
          docker
          docker-compose

          # CUE language
          cue

          # Documentation
          nodePackages.typedoc

          # Security scanning
          gitleaks

          # GraphQL tools
          # nodePackages.graphql-cli  # Uncomment if needed
        ];

        # Runtime dependencies
        buildInputs = with pkgs; [
          # Post-quantum crypto libraries (if needed)
          # These would be for native modules
        ];

      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          inherit nativeBuildInputs buildInputs;

          # Environment variables
          shellHook = ''
            echo "🚀 Preference Injector Development Environment"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "Version: ${version}"
            echo ""
            echo "Available commands:"
            echo "  just --list    # Show all available tasks"
            echo "  just dev       # Start development server"
            echo "  just test      # Run test suite"
            echo "  just ci        # Run full CI pipeline"
            echo ""
            echo "RSR Compliance:"
            echo "  just rsr-verify   # Check compliance"
            echo "  just rsr-score    # Calculate score"
            echo ""

            # Set up Deno environment
            export DENO_DIR="$PWD/.deno"

            # Create necessary directories
            mkdir -p .deno
            mkdir -p dist
            mkdir -p coverage

            # Check if .well-known directory exists
            if [ ! -d ".well-known" ]; then
              echo "⚠️  .well-known/ directory not found"
              echo "Run: just rsr-verify"
            fi

            # Verify critical files
            for file in SECURITY.md CODE_OF_CONDUCT.md MAINTAINERS.md; do
              if [ ! -f "$file" ]; then
                echo "⚠️  Missing: $file"
              fi
            done

            echo ""
            echo "✅ Environment ready!"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          '';

          # Additional environment variables
          DENO_INSTALL_ROOT = "$PWD/.deno/bin";
          PATH = "$DENO_INSTALL_ROOT:$PATH";

          # Security settings
          ENCRYPTION_ALGORITHM = "ed448-kyber1024-blake3";

          # Development settings
          LOG_LEVEL = "debug";
          NODE_ENV = "development";
        };

        # Package definition
        packages.default = pkgs.stdenv.mkDerivation {
          inherit pname version;

          src = ./.;

          nativeBuildInputs = [ pkgs.deno ];

          buildPhase = ''
            # Cache dependencies
            deno cache --lock=deno.lock src/deps.ts

            # Build TypeScript
            deno run --allow-all build.ts

            # Run tests
            deno test --allow-all
          '';

          installPhase = ''
            mkdir -p $out/bin
            mkdir -p $out/lib

            # Copy built files
            cp -r dist/* $out/lib/

            # Create executable wrapper
            cat > $out/bin/preference-injector <<EOF
            #!/usr/bin/env bash
            ${pkgs.deno}/bin/deno run --allow-all $out/lib/main.js "\$@"
            EOF

            chmod +x $out/bin/preference-injector
          '';

          meta = with pkgs.lib; {
            description = "Universal Application Automation Standard with Post-Quantum Security";
            homepage = "https://github.com/Hyperpolymath/preference-injector";
            license = with licenses; [ mit ];  # Note: Also Palimpsest v0.8
            maintainers = [];  # Add maintainers here
            platforms = platforms.all;
          };
        };

        # Apps
        apps.default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/preference-injector";
        };

        apps.dev = {
          type = "app";
          program = "${pkgs.writeShellScript "dev" ''
            ${pkgs.deno}/bin/deno run --watch --allow-all src/main.ts
          ''}";
        };

        apps.test = {
          type = "app";
          program = "${pkgs.writeShellScript "test" ''
            ${pkgs.deno}/bin/deno test --allow-all
          ''}";
        };

        # Checks (run with: nix flake check)
        checks = {
          # Format check
          format = pkgs.runCommand "check-format" {
            nativeBuildInputs = [ pkgs.deno ];
          } ''
            cd ${./.}
            ${pkgs.deno}/bin/deno fmt --check
            touch $out
          '';

          # Lint check
          lint = pkgs.runCommand "check-lint" {
            nativeBuildInputs = [ pkgs.deno ];
          } ''
            cd ${./.}
            ${pkgs.deno}/bin/deno lint
            touch $out
          '';

          # Tests
          test = pkgs.runCommand "run-tests" {
            nativeBuildInputs = [ pkgs.deno ];
          } ''
            cd ${./.}
            ${pkgs.deno}/bin/deno test --allow-all
            touch $out
          '';

          # RSR compliance
          rsr = pkgs.runCommand "check-rsr" {
            nativeBuildInputs = [ pkgs.just ];
          } ''
            cd ${./.}
            ${pkgs.just}/bin/just rsr-verify
            touch $out
          '';
        };

        # Formatter
        formatter = pkgs.deno;

        # Hydra jobs (for continuous integration)
        hydraJobs = {
          inherit (self.packages.${system}) default;
          inherit (self.checks.${system}) format lint test rsr;
        };
      }
    );
}
