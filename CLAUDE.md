# Momentum Portal

The Momentum Portal is a starter app for building on the Kinetic Platform. It provides a self-service portal with pre-built UI, Kinetic Forms, Kinetic Workflows, and patterns for implementing new projects.

This project is intended to be modified for specific project requirements. Developers are free to add different libraries, styles, and reorganize as needed. The theming, structure, and patterns here represent one approach — not the only approach. Since this is a self-service portal starter, other types of apps (admin tools, dashboards, etc.) may need significant reorganization based on requirements.

The main intent of this project is to enable developers and AI tools to understand patterns for interacting with the Kinetic Platform.

**Project-specific documentation** should be added locally to this project. **Reusable Kinetic Platform patterns** should be added to the `ai-skills/` submodule so all projects benefit.

## AI Skills Setup

This project uses shared AI skills for the Kinetic Platform. If the `ai-skills/` directory is empty or missing, initialize the submodule:

    git submodule update --init ai-skills

## Updating Skills

The `ai-skills/` directory is a git submodule pointing to `kineticdata/kinetic-platform-ai-skills`. When you add or modify Kinetic Platform skills, make changes inside `ai-skills/` and submit a pull request to that repository so all projects using these skills benefit from the update.

To update skills to the latest version:

    cd ai-skills && git pull origin main && cd ..

After pulling, remind the user to commit the updated submodule reference in this project.

@ai-skills/CLAUDE.md
