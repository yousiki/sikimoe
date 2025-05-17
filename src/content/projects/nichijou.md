---
title: 'Nichijou'
description: 'Nix configurations for daily life'
publishDate: 'Jan 02 2024'
seo:
  image:
    src: 'https://github.com/yousiki/nichijou/raw/main/static/images/sakamoto.gif'
    alt: Sakamoto from Nichijou
---

![Project preview](https://github.com/yousiki/nichijou/raw/main/static/images/sakamoto.gif)

## 🌟 Overview

Nichijou is a comprehensive Nix configuration framework designed for seamless daily computing across multiple platforms. Named after the Japanese word for "everyday life" (日常), this project provides a cohesive environment for development and system management using the power of [Nix](https://nixos.org/) and the flakes ecosystem.

## ✨ Features

- 🖥️ **Cross-platform Support**: Configurations for both NixOS (Linux) and Darwin (macOS)
- 🏠 **Home Manager Integration**: Comprehensive user environment management
- 🧰 **Development Suites**: Ready-to-use configurations for various programming languages:
  - Rust, Python, JavaScript, C/C++, and Nix development environments
- 🔐 **Secrets Management**: Secure configuration using sops-nix
- 🖲️ **Terminal Suite**: Curated collection of modern terminal tools
  - Includes tmux, starship, eza, zoxide, kitty, btop and more
- 📦 **Binary Cache**: Configured with multiple binary caches for faster builds

## 🏗️ Architecture

Nichijou follows a modular structure based on the [Snowfall](https://github.com/snowfallorg/lib) library:

- **Systems**: Machine-specific configurations
  - `hakase`: Desktop NixOS workstation
  - `nano`: Mac Mini (Apple Silicon)
  - `sakamoto`: MacBook Pro (Intel)
- **Homes**: User-specific home configurations
- **Modules**: Reusable configuration modules
  - Common modules for both NixOS and Darwin
  - Platform-specific modules

## 🖥️ System Management

Nichijou leverages several powerful NixOS/nix-darwin features:

- **Flakes**: Reproducible builds and dependencies
- **Home Manager**: User environment management
- **Sops-nix**: Encrypted secrets management
- **Binary Caches**: Fast package deployment

## 🌿 Built on Giants

This project stands on the shoulders of the Nix ecosystem:

- **Snowfall**: Structural framework
- **Nix-Darwin**: macOS system management
- **Home-Manager**: User environment configuration
- **Catppuccin**: Beautiful theming across applications
- **Sops-nix**: Secure secrets management

## 🗂️ Github Repository

<style>
  td, th {
    vertical-align: middle;
  }
</style>

[github:yousiki/nichijou](https://github.com/yousiki/nichijou)

| Workflows                                                                             | Description                          | Status                                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [Check](https://github.com/yousiki/nichijou/actions/workflows/check.yaml)             | Check the configuration for errors   | ![Check](https://github.com/yousiki/nichijou/actions/workflows/check.yaml/badge.svg)             |
| [Update](https://github.com/yousiki/nichijou/actions/workflows/update.yaml)           | Update flake inputs and packages     | ![Update](https://github.com/yousiki/nichijou/actions/workflows/update.yaml/badge.svg)           |
| [Build hosts](https://github.com/yousiki/nichijou/actions/workflows/build-hosts.yaml) | Build all NixOS and Nix-Darwin hosts | ![Build hosts](https://github.com/yousiki/nichijou/actions/workflows/build-hosts.yaml/badge.svg) |
