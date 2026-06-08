# Olympus Brawler Setup

## Required Developer Tooling

1. GitHub CLI is installed at:

   ```bash
   /Users/michellebruney/.local/bin/gh
   ```

   Add it to your shell path for future Codex and Terminal sessions:

   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile
   source ~/.zprofile
   ```

   Then authenticate and push:

   ```bash
   gh auth login --hostname github.com --git-protocol https --web
   gh auth setup-git
   git push -u origin main
   ```

2. Python is already available globally:

   ```bash
   python3 --version
   pip3 --version
   ```

3. Homebrew still needs an administrator-approved install. Run the official command in Terminal:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   After Homebrew is installed, add it to your shell path if the installer asks:

   ```bash
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```

   Then install Python through Homebrew if you want Brew-managed Python as the standard:

   ```bash
   brew install python
   ```

4. Install project dependencies:

   ```bash
   npm install
   ```

5. Run the game locally:

   ```bash
   npm run dev
   ```

   On macOS, you can also double-click `Play Olympus Brawler.command` in Finder. It starts the local Vite server and opens the browser automatically.

   Opening `index.html` directly with a `file://` URL is not recommended because the game uses JavaScript modules and runtime asset loading. Use the launcher or the local URL instead:

   ```text
   http://127.0.0.1:5173/
   ```

6. Run checks:

   ```bash
   npm run build
   npm run test
   npm run e2e
   npm run asset:audit
   ```

## Recommended Asset Tools

- Aseprite: paid sprite animation tool for hand-authored fighter frames, frame tags, onion skinning, and palettes.
- Pixelorama: free/open-source pixel-art alternative.
- Krita: free/open-source painterly source-art tool for high-resolution character and stage work.
- Tiled: stage layout authoring if arenas move from hard-coded platforms to data files.
- Phaser Texture Atlas Creator: pack fighter frames into atlases once the asset count grows.

## Current Codex Support

- Browser plugin: use after visual/frontend changes to check canvas rendering and console errors.
- GitHub plugin: use after `gh` authentication is working.
- Computer Use / Chrome: use only when a task needs the user's logged-in browser state.
