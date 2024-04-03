# wiki-from-folder Action
[![Tests Passing](https://github.com/quicklysign/wiki-from-folder/actions/workflows/coverage.yml/badge.svg)](https://github.com/quicklysign/wiki-from-folder/actions/workflows/coverage.yml)
[![Generating Wiki](https://github.com/quicklysign/wiki-from-folder/actions/workflows/wiki.yml/badge.svg)](https://github.com/quicklysign/wiki-from-folder/actions/workflows/wiki.yml)

This is a github action that creates a wiki from one or more folders of markdown files, with the option to generate a custom sidebar from the directory structure of the source files.

## Features
More information about the features of this action can be found in the wiki under [feature examples](https://github.com/QuicklySign/wiki-from-folder/wiki/features).
1. ✅ Generates a GitHub wiki from one or more folders of markdown files.
1. ✅ Processes the markdown files to ensure that all relative links work correctly after converting to a wiki. See [here](https://github.com/QuicklySign/wiki-from-folder/wiki/link-processing) for more info.
1. ✅ Optionally generates a sidebar from the directory structure of the source files. Each folder will be a section in the sidebar, and each markdown file will be a link in the sidebar.
1. ✅ Optionally prefixes files with directory path in title. Because github wikis flatten directories into a single list of pages, this action provides the option to prefix the title of each page with the path to the file. This will make it easier to navigate the wiki, and prevent naming conflicts between files in different directories.
1. ✅ Provides the option to clear all existing pages from the wiki before generating the new pages. This is useful if you want to ensure that the wiki is only created from the source files. Any pages created in the GitHub wiki editor will be deleted.
1. ✅ Provides the option to append a warning comment to the top of the markdown of each wiki page it generates to let users know it was generated by an action and point them towards the source file to change if they want to edit that wiki page.

If there is a file named `_sidebar.md` in the root of the folder, it will be used as the sidebar unless you have selected to generate a custom sidebar.

If you wish to have a custom footer, you can include a file named `_footer.md` in the root of the folder.

## Usage
Add a wiki.yml file to your .github/workflows folder containing the following:
```yaml
name: Generate Wiki

on:
  push:
    branches: [ main ]
    paths:
      - docs/**
      - .github/workflows/wiki.yml

jobs:
  generate-wiki:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: quicklysign/wiki-from-folder@v1
      with:
        folders:
        - wiki
        sidebar: true
        clear-wiki: true
```

You can read more about the available options [here](https://github.com/QuicklySign/wiki-from-folder/wiki).